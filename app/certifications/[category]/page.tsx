import { notFound, redirect } from 'next/navigation';
import { certificateCollection } from '@/lib/certificates';

export default async function CertificationsPage({params,searchParams}:{params:Promise<{category:string}>;searchParams:Promise<{certificate?:string}>}){
  const {category}=await params,query=await searchParams;
  const collection=certificateCollection(category);
  if(!collection)notFound();
  const certificate=collection.certificates.find(item=>item.id===query.certificate)??collection.certificates[0];
  redirect('/?certificates='+collection.id+'&certificate='+certificate.id);
}
