import { Cashfree } from "cashfree-pg";

try {
    const cf = new Cashfree({
        xClientId: "test_id",
        xClientSecret: "test_secret",
        xEnvironment: "SANDBOX"
    });
    console.log("Instance created with x-prefix");
    console.log("Instance keys:", JSON.stringify(Object.keys(cf)));
    console.log("cf.xClientId:", cf.xClientId);
    console.log("cf.XClientId:", cf.XClientId);

    const cf2 = new Cashfree({
        clientId: "test_id_2",
        clientSecret: "test_secret_2",
        environment: "sandbox"
    });
    console.log("Instance created without x-prefix");
    console.log("cf2 keys:", JSON.stringify(Object.keys(cf2)));
} catch (e) {
    console.log("Constructor error:", e.message);
}
