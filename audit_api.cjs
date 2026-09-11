const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3000/api';
let results = [];

function assert(condition, message) {
    if(!condition) {
        results.push({ test: message, result: 'FAIL' });
        return false;
    }
    results.push({ test: message, result: 'PASS' });
    return true;
}

async function run() {
    try {
        let loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@bhoomisetu.gov.in", password: "admin123" })
        }).then(r => r.json());
        let adminToken = loginRes.token;
        assert(loginRes.user.role === 'Super Admin', "Super Admin login returns correct role");

        let laoLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "lao.district@bhoomisetu.gov.in", password: "password123" }) // using hardcoded dummy pass if any
        }).then(r => r.json());
        let laoToken = laoLoginRes.token;
        if(laoToken) {
            assert(laoLoginRes.user.role === 'District LAO', "LAO login returns correct role");
        } else {
             results.push({ test: "LAO login", result: 'FAIL - ' + laoLoginRes.error });
        }

        let invalidPropRes = await fetch(`${BASE_URL}/proposals`, {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
            body: JSON.stringify({ projectName: "", ministry: "InvalidMinistry", category: "HighWay", state: "Haryana", district: "Mumbai", areaRequired: -5, action: "submit" })
        });
        assert(invalidPropRes.status === 400, "Backend rejects invalid enum/empty payload");

        let validPropRes = await fetch(`${BASE_URL}/proposals`, {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
            body: JSON.stringify({ projectName: "Test expressway", ministry: "MoUD", category: "Urban Development", state: "Haryana", district: "Gurugram", areaRequired: 10, action: "submit", footprint: JSON.stringify({type: "Polygon", coordinates: [[[0,0],[0,1],[1,1],[0,0]]]}) })
        });
        let validProp = await validPropRes.json();
        assert(validProp.success, "Backend accepts valid proposal creation");
        let propId = validProp.proposal?.id;

        if (propId) {
            let rejectRes = await fetch(`${BASE_URL}/proposals/${propId}/workflow`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                body: JSON.stringify({ actionId: "REJECT", remarks: "" })
            });
            assert(rejectRes.status === 400, "Backend rejects REJECT without reason");

            let validRejectRes = await fetch(`${BASE_URL}/proposals/${propId}/workflow`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                body: JSON.stringify({ actionId: "REJECT", remarks: "Invalid docs" })
            });
            let validReject = await validRejectRes.json();
            assert(validReject.success && validReject.proposal.status === 'REJECTED', "Backend accepts REJECT with reason");
        }

        console.log(JSON.stringify(results, null, 2));
    } catch(e) {
        console.error(e);
    }
}
run();
