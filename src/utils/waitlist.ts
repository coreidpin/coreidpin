interface WaitlistData {
  fullName: string;
  email: string;
  userType: string;
  problemToSolve: string;
  currentVerificationMethod: string;
  usePhoneAsPin: string;
  importanceLevel: string;
  expectedUsage: string;
  heardAboutUs: string;
  country: string;
  wantsEarlyAccess: string;
  willingToProvideFeedback: string;
}

export async function submitWaitlistForm(data: WaitlistData) {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit waitlist form');
  }

  return response.json();
}