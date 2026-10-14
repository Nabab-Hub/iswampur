import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { TournamentBracketData } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await req.json();
    const { matchId, winnerId, scoreA, scoreB, notes } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
    }

    const bracket = await repository.getTournamentBracket(eventId);
    if (!bracket) {
      return NextResponse.json({ error: 'Bracket not found' }, { status: 404 });
    }

    let matchFound = false;
    let roundIndex = -1;

    for (let r = 0; r < bracket.rounds.length; r++) {
      const match = bracket.rounds[r].matches.find((m) => m.id === matchId);
      if (match) {
        matchFound = true;
        roundIndex = r;

        if (scoreA !== undefined) match.teamA.score = scoreA;
        if (scoreB !== undefined && match.teamB) match.teamB.score = scoreB;
        if (notes !== undefined) match.notes = notes;

        if (winnerId) {
          if (match.teamA.id === winnerId) {
            match.winnerId = match.teamA.id;
            match.winnerName = match.teamA.name;
            match.loserId = match.teamB?.id;
            match.loserName = match.teamB?.name;
            match.status = 'COMPLETED';
          } else if (match.teamB && match.teamB.id === winnerId) {
            match.winnerId = match.teamB.id;
            match.winnerName = match.teamB.name;
            match.loserId = match.teamA.id;
            match.loserName = match.teamA.name;
            match.status = 'COMPLETED';
          }
        }
        break;
      }
    }

    if (!matchFound) {
      return NextResponse.json({ error: 'Match not found in bracket' }, { status: 404 });
    }

    // Check if the current round is now fully completed
    const currentRound = bracket.rounds[roundIndex];
    const allMatchesCompleted = currentRound.matches.every(
      (m) => m.status === 'COMPLETED' || m.status === 'BYE_ADVANCED'
    );

    if (allMatchesCompleted) {
      currentRound.status = 'COMPLETED';

      // Check if this was the Final match!
      const isFinalRound =
        (currentRound.matches.length === 1 && Boolean(currentRound.matches[0].teamB)) ||
        (currentRound.roundName.en.toLowerCase().includes('final') &&
          !currentRound.roundName.en.toLowerCase().includes('semi') &&
          !currentRound.roundName.en.toLowerCase().includes('quarter'));

      if (isFinalRound) {
        const finalMatch = currentRound.matches[0];
        if (finalMatch && finalMatch.winnerName) {
          bracket.isComplete = true;
          bracket.standings = bracket.standings || {};
          bracket.standings.champion = {
            id: finalMatch.winnerId || '',
            name: finalMatch.winnerName,
          };
          if (finalMatch.loserName) {
            bracket.standings.runnerUp = {
              id: finalMatch.loserId || '',
              name: finalMatch.loserName,
            };
          }

          // Populate 3rd place from semi-final losing contenders
          if (!bracket.standings.thirdPlace && bracket.rounds.length >= 2) {
            const semiRound = bracket.rounds.find(
              (r) =>
                r.roundNumber === currentRound.roundNumber - 1 ||
                r.roundName.en.toLowerCase().includes('semi')
            );
            if (semiRound) {
              const semiLoser = semiRound.matches.find((m) => m.loserId && m.loserName);
              if (semiLoser && semiLoser.loserId && semiLoser.loserName) {
                bracket.standings.thirdPlace = {
                  id: semiLoser.loserId,
                  name: semiLoser.loserName,
                };
              }
            }
          }
        }
      }
    } else {
      currentRound.status = 'IN_PROGRESS';
    }

    const updated = await repository.saveTournamentBracket(bracket);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
