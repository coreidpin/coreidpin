
const url = 'https://evcqpapvcvmljgqiuzsq.supabase.co/functions/v1/auth-otp/admin/assign-pin';
const pin = 'PIN-NG-2025-3E634F';

async function run() {
    console.log(`Assigning PIN ${pin}...`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });
        
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (err) {
        console.error('Failed:', err);
    }
}

run();
