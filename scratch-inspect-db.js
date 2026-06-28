import { createClient } from "@supabase/supabase-js";

const url = "https://fkjqpuqyxkvbhlagvfvo.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZranFwdXF5eGt2YmhsYWd2ZnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTUwOTMsImV4cCI6MjA5ODEzMTA5M30.WObxMXRy2UEPllzv6S7CEYRzoA_wWVDEGJM3yumt1xo";

const supabase = createClient(url, key);

async function inspect() {
  console.log("Connecting to Supabase at:", url);
  
  // Test listing ranches
  const { data: ranches, error: rError } = await supabase.from("ranches").select("*");
  if (rError) {
    console.error("Error fetching ranches:", rError);
  } else {
    console.log("Ranches in DB:", ranches.map(r => ({ id: r.id, name: r.name })));
  }

  // Test inserting a test ranch with text ID
  console.log("\nTesting insert of ranch with text ID 'ranch-test-text'...");
  const { data: insertTextData, error: insertTextError } = await supabase
    .from("ranches")
    .insert({ id: "ranch-test-text", name: "Ranch with Text ID", guide_content: {} })
    .select();
  
  if (insertTextError) {
    console.error("Text ID insert failed (expected if UUID):", insertTextError.message);
  } else {
    console.log("Text ID insert succeeded! Data:", insertTextData);
    // Cleanup
    await supabase.from("ranches").delete().eq("id", "ranch-test-text");
  }

  // Test inserting a test ranch with UUID ID
  const testUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  console.log("\nTesting insert of ranch with UUID ID...");
  const { data: insertUuidData, error: insertUuidError } = await supabase
    .from("ranches")
    .insert({ id: testUuid, name: "Ranch with UUID ID", guide_content: {} })
    .select();

  if (insertUuidError) {
    console.error("UUID ID insert failed:", insertUuidError.message);
  } else {
    console.log("UUID ID insert succeeded! Data:", insertUuidData);
    // Cleanup
    await supabase.from("ranches").delete().eq("id", testUuid);
  }
}

inspect();
