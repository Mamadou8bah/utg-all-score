import Manager from "@/components/admin/agents-manager";
export default async function Page({params}:{params:Promise<{id:string}>}) { const {id}=await params; return <Manager agentId={id} key={id} />; }
