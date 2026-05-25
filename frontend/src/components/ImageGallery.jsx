import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images = [], title = '' }) {
  const [active, setActive] = useState(0);
  const all = images.length > 0 ? images : [{ image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' }];

  return (
    <div>
      <div style={{ position:'relative', borderRadius:'var(--radius)', overflow:'hidden', height:420, marginBottom:12 }}>
        <img src={all[active]?.image_url || all[active]?.src}
          alt={`${title} - Image ${active+1}`}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e => e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}/>
        {all.length > 1 && (
          <>
            <button onClick={() => setActive(a => (a-1+all.length)%all.length)}
              style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
                background:'rgba(0,0,0,0.6)', border:'none', color:'white', borderRadius:'50%',
                width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronLeft size={20}/>
            </button>
            <button onClick={() => setActive(a => (a+1)%all.length)}
              style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)',
                background:'rgba(0,0,0,0.6)', border:'none', color:'white', borderRadius:'50%',
                width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ChevronRight size={20}/>
            </button>
            <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)',
              background:'rgba(0,0,0,0.5)', padding:'4px 12px', borderRadius:20, fontSize:'0.8rem' }}>
              {active+1} / {all.length}
            </div>
          </>
        )}
      </div>
      {all.length > 1 && (
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {all.map((img, i) => (
            <img key={i} src={img.image_url || img.src}
              alt={`Thumbnail ${i+1}`}
              onClick={() => setActive(i)}
              style={{ width:80, height:60, objectFit:'cover', borderRadius:8, cursor:'pointer', flexShrink:0,
                border: active === i ? '2px solid var(--accent-gold)' : '2px solid transparent',
                opacity: active === i ? 1 : 0.7, transition:'all 0.2s' }}
              onError={e => e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}/>
          ))}
        </div>
      )}
    </div>
  );
}
