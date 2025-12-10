import { json } from '@sveltejs/kit';
import { JournalEntry } from '$lib/db/models/JournalEntry.js';
import { getSession } from '$lib/auth/session.js';

/**
 * Handle journal entry operations
 * GET: Get entry for a specific date
 * POST: Save/update entry for a specific date
 * DELETE: Delete entry for a specific date
 */
export async function GET({ request, url }) {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dateParam = url.searchParams.get('date');
    
    if (!dateParam) {
      return json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return json({ error: 'Invalid date format' }, { status: 400 });
    }

    const entry = await JournalEntry.findByDate(session.userId, date);

    return json({
      entry: entry ? {
        _id: entry._id.toString(),
        date: entry.date,
        content: entry.content,
        chatMessages: entry.chatMessages || [],
        comicImageUrls: entry.comicImageUrls || [],
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      } : null
    });
  } catch (error) {
    console.error('Get journal entry error:', error);
    return json({ error: 'Failed to get journal entry' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { date, content, chatMessages, comicImageUrls } = body;

    if (!date) {
      return json({ error: 'Date is required' }, { status: 400 });
    }

    const entryDate = new Date(date);
    if (isNaN(entryDate.getTime())) {
      return json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Only include chat/images in the update if the client actually sent them.
    // This prevents wiping existing chat history or comics when auto-saving text.
    const hasChat = Array.isArray(chatMessages);
    const hasImages = Array.isArray(comicImageUrls);

    const validChatMessages = hasChat
      ? chatMessages.filter(
          (msg) =>
            msg &&
            typeof msg === 'object' &&
            (msg.role === 'user' || msg.role === 'assistant') &&
            typeof msg.content === 'string'
        )
      : undefined;

    const validComicImageUrls = hasImages
      ? comicImageUrls.filter((url) => typeof url === 'string' && url.length > 0)
      : undefined;

    // Optional: extract mood or other metadata from content
    const entry = await JournalEntry.upsert(
      session.userId,
      entryDate,
      content || '',
      validChatMessages,
      validComicImageUrls,
      {}
    );

    if (!entry) {
      return json({ error: 'Failed to persist journal entry' }, { status: 500 });
    }

    return json({
      success: true,
      entry: {
        _id: entry._id.toString(),
        date: entry.date,
        content: entry.content,
        chatMessages: entry.chatMessages || [],
        comicImageUrls: entry.comicImageUrls || [],
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    });
  } catch (error) {
    console.error('Save journal entry error:', error);
    return json({ error: 'Failed to save journal entry' }, { status: 500 });
  }
}

export async function DELETE({ request, url }) {
  try {
    const session = await getSession(request);

    if (!session || !session.userId) {
      return json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dateParam = url.searchParams.get('date');
    
    if (!dateParam) {
      return json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return json({ error: 'Invalid date format' }, { status: 400 });
    }

    const deleted = await JournalEntry.delete(session.userId, date);

    return json({
      success: true,
      deleted
    });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return json({ error: 'Failed to delete journal entry' }, { status: 500 });
  }
}

