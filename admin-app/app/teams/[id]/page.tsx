import Manager from "@/components/admin/teams-manager";
export default async function Page({params}:{params:Promise<{id:string}>}) { const {id}=await params; return <Manager teamId={id} key={id} />; }
