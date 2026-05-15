import { getReadinessReport } from "../../../lib/production-readiness";

export async function GET() {
  return Response.json(getReadinessReport());
}
