export const triggerActivityLog = async (actionType: string, description: string, metadata: Record<string, unknown> = {}) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr) as { id: string };

    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        actionType,
        description,
        metadata
      })
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};
