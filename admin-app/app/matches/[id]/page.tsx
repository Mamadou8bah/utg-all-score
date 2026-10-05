import Manager from "@/components/admin/matches-manager";
export default async function Page({params}:{params:Promise<{id:string}>}) {const {id}=await params;return <Manager matchId={id} key={id}/>;}
