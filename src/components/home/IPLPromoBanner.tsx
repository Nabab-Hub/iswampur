'use client';

import React from 'react';
import ActiveEventsSpotlight from './ActiveEventsSpotlight';
import { VillageEvent } from '@/types';

export default function IPLPromoBanner({ events = [] }: { events?: VillageEvent[] }) {
  return <ActiveEventsSpotlight events={events} />;
}
