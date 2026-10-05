import Manager from "@/components/admin/schools-manager";
export default async function Page({params}:{params:Promise<{id:string}>}) { const {id}=await params; return <Manager schoolId={id} key={id} />; }
