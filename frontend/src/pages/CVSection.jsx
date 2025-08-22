// CV Section page for user profile
import Card from "../components/Card";
import { supabase } from "../../supabaseClient";

export default function CVSection() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">CV / Resume</h1>
      <Card>
        <p className="text-gray-700">This section will allow users to upload, view, and edit their CV or resume. (Feature coming soon!)</p>
      </Card>
    </div>
  );
}
