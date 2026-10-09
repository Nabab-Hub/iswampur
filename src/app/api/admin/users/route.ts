import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { AdminUser } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const actorEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();
    if (actorEmail !== superAdminEmail) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin credentials required' }, { status: 403 });
    }

    const admins = await repository.getAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    console.error('Failed to get admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actorEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();
    if (actorEmail !== superAdminEmail) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin credentials required' }, { status: 403 });
    }

    const body = await req.json();

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = body.email.toLowerCase().trim();
    const existing = await repository.getAdminByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 400 }
      );
    }

    const newAdmin: AdminUser = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: normalizedEmail,
      name: body.name || normalizedEmail.split('@')[0],
      role: body.role === 'super_admin' ? 'super_admin' : 'admin',
      permissions: body.permissions || [
        'events.manage',
        'registrations.view',
        'registrations.review',
      ],
      eventScope: body.eventScope || [],
      active: true,
      addedBy: actorEmail,
      createdAt: new Date().toISOString(),
    };

    const saved = await repository.saveAdmin(newAdmin);

    await repository.logAction({
      actorEmail,
      actorRole: 'super_admin',
      action: 'ADMIN_CREATED',
      targetType: 'ADMIN',
      targetId: normalizedEmail,
      metadata: { permissions: newAdmin.permissions },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Failed to create admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const actorEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();
    if (actorEmail !== superAdminEmail) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin credentials required' }, { status: 403 });
    }

    const body = await req.json();

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = body.email.toLowerCase().trim();
    const existing = await repository.getAdminByEmail(normalizedEmail);
    if (!existing) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const updated: AdminUser = {
      ...existing,
      name: body.name !== undefined ? body.name : existing.name,
      permissions: body.permissions !== undefined ? body.permissions : existing.permissions,
      eventScope: body.eventScope !== undefined ? body.eventScope : existing.eventScope,
      active: body.active !== undefined ? Boolean(body.active) : existing.active,
    };

    const saved = await repository.saveAdmin(updated);

    await repository.logAction({
      actorEmail,
      actorRole: 'super_admin',
      action: 'ADMIN_PERMISSIONS_UPDATED',
      targetType: 'ADMIN',
      targetId: normalizedEmail,
      metadata: { permissions: updated.permissions, active: updated.active },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error('Failed to update admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const actorEmail = (req.headers.get('x-user-email') || '').toLowerCase().trim();
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'skahidulla568@gmail.com').toLowerCase().trim();
    if (actorEmail !== superAdminEmail) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin credentials required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await repository.deleteAdmin(email);

    await repository.logAction({
      actorEmail,
      actorRole: 'super_admin',
      action: 'ADMIN_REMOVED',
      targetType: 'ADMIN',
      targetId: email,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to remove admin' },
      { status: 400 }
    );
  }
}
