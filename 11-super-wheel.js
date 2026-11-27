// Ruang Mabar module: 11-super-wheel.js
// Keep this file loaded in the order declared in index.html.
        // LUCKY ROYALE / SUPER WHEEL
        function openLuckyRoyalePage() { document.getElementById('luckyRoyalePage').style.display='flex'; }
        let autoSpinRequested = false;
        let autoSpinRunning = false;
        function toggleAutoSpinWheel() {
            const btn=document.getElementById('btnAutoSpinWheel');
            if (autoSpinRunning) { autoSpinRequested=true; btn.style.background='#dc2626'; btn.textContent='Berhenti memutar'; return; }
            autoSpinRequested=false; autoSpinRunning=true; btn.style.background='#dc2626'; btn.textContent='Berhenti memutar';
            (async()=>{ try { while(!autoSpinRequested) { await spinWheel(); if(autoSpinRequested) break; if(!activeLoggedInMemberKey) break; const m=globalMembersData[activeLoggedInMemberKey]; if(!m || Number(m.diamond||0)<50) break; } } finally { autoSpinRunning=false; autoSpinRequested=false; btn.style.background='#2563eb'; btn.textContent='🔁 Spin Otomatis'; } })();
        }
        let isSuperSpinning=false, superWheelRotation=0;
        function drawSuperWheel(){ const c=document.getElementById('superWheelCanvas'); if(!c)return; const x=c.getContext('2d'), n=superWheelPrizes.length, arc=2*Math.PI/n; x.clearRect(0,0,280,280); superWheelPrizes.forEach((p,i)=>{const a=i*arc;x.beginPath();x.fillStyle=p.color;x.moveTo(140,140);x.arc(140,140,140,a,a+arc);x.closePath();x.fill();x.save();x.translate(140,140);x.rotate(a+arc/2);x.textAlign='right';x.fillStyle='#fff';x.font='bold 10px Poppins,sans-serif';x.fillText(p.label,130,4);x.restore();}); }
        function openSuperWheelModal(){ document.getElementById('superWheelModal').style.display='flex'; updateSuperTicketLabel(); drawSuperWheel(); }
        function updateSuperTicketLabel(){const el=document.getElementById('superWheelUserTickets');const m=activeLoggedInMemberKey&&globalMembersData[activeLoggedInMemberKey];el.textContent=m?`🎟️ Super Tiket Kamu: ${Number(m.superTickets||0)}`:'🎟️ Login untuk bermain';}
        async function spinSuperWheel(){
            if(isSuperSpinning)return;
            if(!activeLoggedInMemberKey){alert('Login terlebih dahulu di tab Personalisasi untuk bermain!');switchTab('personal');return;}
            const key=activeLoggedInMemberKey, member=globalMembersData[key];
            if(!member||Number(member.superTickets||0)<1){alert('Super Tiket kamu tidak cukup untuk Spin!');return;}
            const btn=document.getElementById('btnSpinSuperWheel'),msg=document.getElementById('superSpinResultMessage'); isSuperSpinning=true;btn.disabled=true;btn.style.background='#9ca3af';msg.textContent='🌀 Memutar Super Wheel...';
            let lock=false;const token=`${Date.now()}_${Math.random().toString(36).slice(2)}`;
            try{
                const ticketRef=database.ref(`members/${key}/superTickets`);const snap=await ticketRef.once('value');const tickets=Number(snap.val()||0);if(tickets<1)throw new Error('Super Tiket kamu tidak cukup untuk Spin!');
                const lr=await database.ref(`members/${key}/superWheelSpinLock`).transaction(cur=>{if(cur&&Date.now()-Number(cur.lockedAt||0)<15000)return;return {lockedAt:Date.now(),token};});if(!lr.committed||!lr.snapshot.val()||lr.snapshot.val().token!==token)throw new Error('Spin sedang diproses. Tunggu sebentar ya.');lock=true;
                let r=Math.random()*superWheelPrizes.reduce((a,p)=>a+p.chance,0),idx=0;for(let i=0;i<superWheelPrizes.length;i++){if(r<superWheelPrizes[i].chance){idx=i;break;}r-=superWheelPrizes[i].chance;}const prize=superWheelPrizes[idx];const arc=360/superWheelPrizes.length;let off=(270-(idx*arc+arc/2))%360;if(off<0)off+=360;superWheelRotation=Math.ceil(superWheelRotation/360)*360+1800+off;document.getElementById('superWheelCanvas').style.transform=`rotate(${superWheelRotation}deg)`;await new Promise(res=>setTimeout(res,3000));
                const updates={};
                if(prize.type==='diamond'){const d=Number(member.diamond||0)+prize.val;updates[`members/${key}/diamond`]=d;member.diamond=d;}
                else if(prize.type==='star'){
                    const starRef=database.ref(`members/${key}/bintang`);
                    const beforeSnap=await starRef.once('value');
                    const beforeStars=Number(beforeSnap.val()||0);
                    wheelStarUpdatePending[key]=true;
                    await starRef.set(beforeStars+Number(prize.val||0));
                    const verifySnap=await starRef.once('value');
                    const verifiedStars=Number(verifySnap.val()||0);
                    member.bintang=verifiedStars;
                    lastKnownMemberStars[key]=verifiedStars;
                    if(verifiedStars>beforeStars) await recordQuestStars(verifiedStars-beforeStars);
                }
                else if(prize.type==='hiasan_profil'){addItemToInventory(updates,key,member,{itemId:prize.id,itemName:prize.name,itemType:'Hiasan Profil',count:1});}
                else if(prize.type==='hiasan_nama'){const unlocked=getItemArray(member.unlockedHiasan);if(!unlocked.includes(prize.id))unlocked.push(prize.id);updates[`members/${key}/unlockedHiasan`]=unlocked;addItemToInventory(updates,key,member,{itemId:prize.id,itemName:prize.name,itemType:'Hiasan Nama',count:1});}
                else {const inv=getItemArray(member.inventory);inv.push({id:prize.id,name:prize.name,type:'Item',count:1});updates[`members/${key}/inventory`]=inv;}
                updates[`members/${key}/superTickets`]=tickets-1;await database.ref().update(updates);member.superTickets=tickets-1;globalMembersData[key]=member;updateSuperTicketLabel();if(typeof updateMemberPersonalView==='function')updateMemberPersonalView(member);msg.textContent=`🎉 Selamat! Kamu mendapatkan: ${prize.name}!`;
            }catch(e){console.error('Super Wheel failed:',e);msg.textContent=e.message||'Hadiah belum berhasil disimpan. Silakan coba lagi.';}
            finally{wheelStarUpdatePending[key]=false;if(lock)try{await database.ref(`members/${key}/superWheelSpinLock`).transaction(cur=>cur&&cur.token===token?null:cur);}catch(e){}isSuperSpinning=false;btn.disabled=false;btn.style.background='';}
        }
