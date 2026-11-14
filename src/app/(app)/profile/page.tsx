import { redirect } from "next/navigation";
import { requireOnboardedRider } from "@/features/profile/server/queries";

export default async function MyProfilePage() {
  const rider = await requireOnboardedRider();
  redirect(`/profile/${rider.profile.username}`);
}
