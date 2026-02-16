export function downloadSymptomPdf() {
  const token = localStorage.getItem('period_app_user_token');
  if (!token) return Promise.reject(new Error('Not authenticated. Please complete onboarding.'));
  return fetch('/api/logs/pdf', { headers: { 'x-user-token': token } })
    .then(async (res) => {
      if (res.ok) return res.blob();
      const text = await res.text();
      if (res.status === 404) throw new Error(text || 'No symptom logs to export.');
      throw new Error(text || 'Could not download PDF.');
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'symptom_report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    });
}
