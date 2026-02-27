import dns from 'dns';
import https from 'https';

dns.setServers(['8.8.8.8']);

async function testManualDnsUpload() {
    const host = 'idzkqpszpdjfozvycoar.supabase.co';
    const path = '/storage/v1/object/public/memories/test.txt';

    console.log(`Resolving ${host} via Google DNS...`);

    dns.resolve4(host, (err, addresses) => {
        if (err || addresses.length === 0) {
            console.error('DNS Resolution failed:', err);
            return;
        }

        const ip = addresses[0];
        console.log(`Resolved to ${ip}. Attempting HTTPS request...`);

        const options = {
            hostname: ip,
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Host': host
            },
            servername: host // Crucial for SNI
        };

        const req = https.request(options, (res) => {
            console.log('Status code:', res.statusCode);
            res.on('data', (d) => process.stdout.write(d));
        });

        req.on('error', (e) => {
            console.error('Request error:', e);
        });

        req.end();
    });
}

testManualDnsUpload();
