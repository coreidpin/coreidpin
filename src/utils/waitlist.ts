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
  const response = await fetch('https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y3FwYXB2Y3ZtbGpncWl1enNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODk2MzIsImV4cCI6MjA3ODM2NTYzMn0.U4XapYqi_4KAemNTwx88mLVBKVrzBp0_mMrIgZwcXa8'
    },
    body: JSON.stringify({
      full_name: data.fullName,
      email: data.email,
      user_type: data.userType,
      problem_to_solve: data.problemToSolve,
      current_verification_method: data.currentVerificationMethod,
      use_phone_as_pin: data.usePhoneAsPin,
      importance_level: data.importanceLevel,
      expected_usage: data.expectedUsage,
      heard_about_us: data.heardAboutUs,
      country: data.country,
      wants_early_access: data.wantsEarlyAccess,
      willing_to_provide_feedback: data.willingToProvideFeedback
    })
  });

  if (!response.ok) {
    let message = 'Failed to submit waitlist form';
    try {
      const err = await response.json();
      message = err.error || err.message || message;
    } catch (_) {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.json();
}