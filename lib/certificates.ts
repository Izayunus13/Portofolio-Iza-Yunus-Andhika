import type { CategoryId } from './portfolio';

export type Certificate={id:string;title:string;image:string;document?:string;originalImage?:string;comingSoon?:boolean;description:string;skills:string[];issuer:string|null;issuedAt:string|null;credentialId:string|null;verificationUrl:string|null;sample:boolean};
export type CertificateCollection={id:CategoryId;port:number;island:string;discipline:string;intro:string;certificates:Certificate[]};
const programmingCertificates:Certificate[]=[
  {
    "id": "programming-1",
    "title": "Python Essentials 2",
    "image": "/certificates/programming/python-essentials-2.webp",
    "document": "/certificates/programming/python-essentials-2.pdf",
    "description": "I completed Python Essentials 2 through the Cisco Networking Academy program on 2 July 2026. This course-completion certificate marks a further step in my Python learning and my continuing development as a software engineer. It reflects my commitment to strengthening my programming foundation through structured study, alongside the technical projects presented in this portfolio.",
    "skills": [
      "Python",
      "Programming",
      "Structured learning"
    ],
    "issuer": "Cisco Networking Academy",
    "issuedAt": "2 July 2026",
    "credentialId": "7aa4eb5c-b8e6-402c-b85b-d87853207cb4",
    "verificationUrl": null,
    "sample": false
  },
  {
    "id": "programming-2",
    "title": "CS107: C++ Programming",
    "image": "/certificates/programming/cs107-cpp-programming.webp",
    "document": "/certificates/programming/cs107-cpp-programming.pdf",
    "description": "I completed CS107: C++ Programming with Saylor University on 21 July 2026. The accompanying course record lists 40 hours of learning, 4 Continuing Education Units, and a final grade of 87.50%. This certificate of achievement documents a focused period of C++ study as part of my software engineering learning journey. The original two-page PDF includes both the achievement certificate and the detailed course record.",
    "skills": [
      "C++",
      "Programming",
      "Structured learning"
    ],
    "issuer": "Saylor University",
    "issuedAt": "21 July 2026",
    "credentialId": "0074043491IY",
    "verificationUrl": "https://learn.saylor.org/admin/tool/certificate/index.php?code=0074043491IY",
    "sample": false
  }
];

const videographyCertificates:Certificate[]=[
  {
    "id": "videography-1",
    "title": "Juara I Video - POINTS 2024",
    "image": "/certificates/videography/points-2024-first-place.webp",
    "originalImage": "/certificates/videography/points-2024-first-place-original.jpeg",
    "description": "First-place recognition in the video category at POINTS 2024, held from 21 September to 26 October 2024. This certificate is from the Faculty of Science and Mathematics at Universitas Diponegoro and records the award as \"Juara I Video\". The achievement forms part of my videography and editing collection.",
    "skills": [
      "Video",
      "Competition",
      "First place"
    ],
    "issuer": "Fakultas Sains dan Matematika, Universitas Diponegoro",
    "issuedAt": null,
    "credentialId": null,
    "verificationUrl": null,
    "sample": false
  },
  {
    "id": "videography-2",
    "title": "Coming soon",
    "image": "/certificates/coming-soon.svg",
    "description": "The next videography milestone will appear here. More certificates are coming soon.",
    "skills": [],
    "issuer": null,
    "issuedAt": null,
    "credentialId": null,
    "verificationUrl": null,
    "sample": false,
    "comingSoon": true
  },
  {
    "id": "videography-3",
    "title": "Coming soon",
    "image": "/certificates/coming-soon.svg",
    "description": "The next videography milestone will appear here. More certificates are coming soon.",
    "skills": [],
    "issuer": null,
    "issuedAt": null,
    "credentialId": null,
    "verificationUrl": null,
    "sample": false,
    "comingSoon": true
  }
];

const designCertificates:Certificate[]=[
  {
    "id": "design-1",
    "title": "Coming soon",
    "image": "/certificates/coming-soon.svg",
    "description": "Design and visual certificates will be added here. More milestones are coming soon.",
    "skills": [],
    "issuer": null,
    "issuedAt": null,
    "credentialId": null,
    "verificationUrl": null,
    "sample": false,
    "comingSoon": true
  },
  {
    "id": "design-2",
    "title": "Coming soon",
    "image": "/certificates/coming-soon.svg",
    "description": "Design and visual certificates will be added here. More milestones are coming soon.",
    "skills": [],
    "issuer": null,
    "issuedAt": null,
    "credentialId": null,
    "verificationUrl": null,
    "sample": false,
    "comingSoon": true
  },
  {
    "id": "design-3",
    "title": "Coming soon",
    "image": "/certificates/coming-soon.svg",
    "description": "Design and visual certificates will be added here. More milestones are coming soon.",
    "skills": [],
    "issuer": null,
    "issuedAt": null,
    "credentialId": null,
    "verificationUrl": null,
    "sample": false,
    "comingSoon": true
  }
];

const previews=[
  {id:'programming' as const,island:'Bytehaven',discipline:'Software Engineering',intro:'A growing collection of the ideas, tools, and practices behind reliable software.',titles:['Web engineering foundations.','Structured data, clear thinking.','Software built to grow.'],skills:[['Web development','Clean code','Responsive interfaces'],['Databases','Data modeling','SQL'],['Architecture','Problem solving','Maintainability']]},
  {id:'design' as const,island:'Pigment Atoll',discipline:'Website & Visual Design',intro:'Discoveries in visual language, thoughtful interfaces, and designing around people.',titles:['Thoughtful digital interfaces.','A language of colour and form.','Designing around people.'],skills:[['UI design','Layout','Visual hierarchy'],['Typography','Colour','Visual identity'],['UX research','Prototyping','Interaction']]},
  {id:'videography' as const,island:'Framewake Bay',discipline:'Videography & Editing',intro:'Milestones in framing, rhythm, and turning everyday moments into stories.',titles:['Stories through the lens.','Finding the rhythm.','A thoughtful finishing touch.'],skills:[['Composition','Framing','Visual storytelling'],['Editing','Pacing','Sound'],['Colour grading','Post-production','Delivery']]},
];
// Earned credentials and explicit Coming soon slots are independent for each island.
export const certificateCollections:CertificateCollection[]=previews.map((collection,index)=>({
  id:collection.id,port:index+1,island:collection.island,discipline:collection.discipline,intro:collection.intro,
  certificates:collection.id==='programming'?programmingCertificates:collection.id==='videography'?videographyCertificates:designCertificates
}));
export function certificateCollection(id:string){return certificateCollections.find(collection=>collection.id===id);}
export function certificateHref(port:number,index=0){const collection=certificateCollections.find(collection=>collection.port===port)!;return '/certifications/'+collection.id+'?certificate='+collection.certificates[index%collection.certificates.length].id;}

export function certificateSummary(collection:CertificateCollection){
  const pending=collection.certificates.filter(item=>item.comingSoon).length;
  const available=collection.certificates.length-pending;
  if(!available)return 'Coming soon';
  return String(available).padStart(2,'0')+' certificate'+(available===1?'':'s')+(pending?' / '+String(pending).padStart(2,'0')+' coming soon':'');
}
