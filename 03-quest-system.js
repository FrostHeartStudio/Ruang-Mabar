// Ruang Mabar module: 03-quest-system.js
// Keep this file loaded in the order declared in index.html.
        // QUEST SYSTEM: progres tersimpan di Firebase per member.
        function questWibDate(ts = Date.now()) {
            return new Date(ts + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
        }
        function questWeekStart(dateStr = questWibDate()) {
            const d = new Date(dateStr + 'T00:00:00Z');
            const day = d.getUTCDay();
            d.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
            return d.toISOString().slice(0, 10);
        }
        function questWeekEnd(start) {
            const d = new Date(start + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 7); return d.toISOString().slice(0, 10);
        }
        function questDataFor(member) { return (member && member.questData) || {}; }
        function questSafeInteger(value, fallback = 0) {
            const number = Number(value);
            return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
        }
        function questEnsureObject(parent, key) {
            if (!parent[key] || typeof parent[key] !== 'object' || Array.isArray(parent[key])) parent[key] = {};
            return parent[key];
        }
        function questDailyFor(member, date = questWibDate()) { return questDataFor(member).daily?.[date] || {}; }
        function questWeeklyFor(member, start = questWeekStart()) { return questDataFor(member).weekly?.[start] || {}; }
        function mutateQuestData(memberKey, mutator) {
            if (!memberKey) return Promise.resolve();
            return database.ref(`members/${memberKey}/questData`).transaction(current => {
                current = current && typeof current === 'object' ? current : {};
                mutator(current);
                return current;
            }).then(() => {
                if (activeLoggedInMemberKey === memberKey) renderQuestUI();
            }).catch(err => console.error('Quest update failed:', err));
        }
        function questMarkDaily(memberKey, field, value = true) {
            const date = questWibDate();
            return mutateQuestData(memberKey, q => {
                const daily = questEnsureObject(q, 'daily');
                const dailyEntry = questEnsureObject(daily, date);
                dailyEntry[field] = value;
            });
        }
        function recordQuestChat() {
            if (!activeLoggedInMemberKey) return;
            return questMarkDaily(activeLoggedInMemberKey, 'chatDone', true);
        }
        function recordQuestShopPurchase() {
            if (!activeLoggedInMemberKey) return;
            const date = questWibDate(), week = questWeekStart(date), key = activeLoggedInMemberKey;
            return mutateQuestData(key, q => {
                const daily = questEnsureObject(q, 'daily');
                const dailyEntry = questEnsureObject(daily, date);
                dailyEntry.shopPurchases = questSafeInteger(dailyEntry.shopPurchases) + 1;
                const weekly = questEnsureObject(q, 'weekly');
                const weeklyEntry = questEnsureObject(weekly, week);
                weeklyEntry.shopPurchases = questSafeInteger(weeklyEntry.shopPurchases) + 1;
            });
        }
        function recordQuestStars(amount) {
            const safeAmount = Number(amount);
            if (!activeLoggedInMemberKey || !Number.isSafeInteger(safeAmount) || safeAmount <= 0) return Promise.resolve();
            const date = questWibDate(), week = questWeekStart(date), key = activeLoggedInMemberKey;
            return mutateQuestData(key, q => {
                const daily = questEnsureObject(q, 'daily');
                const dailyEntry = questEnsureObject(daily, date);
                const weekly = questEnsureObject(q, 'weekly');
                const weeklyEntry = questEnsureObject(weekly, week);
                const dailyStars = questSafeInteger(dailyEntry.stars);
                const weeklyStars = questSafeInteger(weeklyEntry.stars);
                if (Number.isSafeInteger(dailyStars + safeAmount)) dailyEntry.stars = dailyStars + safeAmount;
                if (Number.isSafeInteger(weeklyStars + safeAmount)) weeklyEntry.stars = weeklyStars + safeAmount;
            });
        }
        function recordQuestLogin(memberKey) {
            const date = questWibDate(), week = questWeekStart(date);
            return mutateQuestData(memberKey, q => {
                const loginDates = questEnsureObject(q, 'loginDates');
                if (!loginDates[date]) {
                    const yesterday = new Date(date + 'T00:00:00Z'); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
                    const y = yesterday.toISOString().slice(0, 10);
                    const previousStreak = questSafeInteger(q.loginStreak);
                    q.loginStreak = q.lastLoginDate === y && Number.isSafeInteger(previousStreak + 1) ? previousStreak + 1 : 1;
                    loginDates[date] = true;
                    q.lastLoginDate = date;
                }
                const weekly = questEnsureObject(q, 'weekly');
                const weeklyEntry = questEnsureObject(weekly, week);
                weeklyEntry.loginDates = questEnsureObject(weeklyEntry, 'loginDates');
                weeklyEntry.loginDates[date] = true;
            });
        }
        function startQuestTimeTracking() {
            if (questTimeTicker) clearInterval(questTimeTicker);
            questTimeTicker = setInterval(() => {
                const key = activeLoggedInMemberKey;
                if (!key || !globalMembersData[key]) return;
                const date = questWibDate(), week = questWeekStart(date);
                mutateQuestData(key, q => {
                    const daily = questEnsureObject(q, 'daily');
                    const dailyEntry = questEnsureObject(daily, date);
                    dailyEntry.minutes = questSafeInteger(dailyEntry.minutes) + 1;
                    const weekly = questEnsureObject(q, 'weekly');
                    const weeklyEntry = questEnsureObject(weekly, week);
                    weeklyEntry.minutes = questSafeInteger(weeklyEntry.minutes) + 1;
                });
            }, 60000);
        }
        function questDailyCompletedCount(member) {
            const q = questDataFor(member), start = questWeekStart(), end = questWeekEnd(start);
            let count = 0;
            Object.keys(q.daily || {}).forEach(date => {
                if (date < start || date >= end) return;
                const d = q.daily[date] || {};
                const dailyCoreDone = !!d.chatDone && questSafeInteger(d.stars) >= 10 && questSafeInteger(d.shopPurchases) >= 1 && questSafeInteger(d.minutes) >= 10;
                if (d.chatDone) count++;
                if (questSafeInteger(d.stars) >= 10) count++;
                if (questSafeInteger(d.shopPurchases) >= 1) count++;
                if (questSafeInteger(d.minutes) >= 10) count++;
                if (dailyCoreDone) count++; // bonus penyelesaian semua misi harian
            });
            return count;
        }
        function questDefinitions(member) {
            const date = questWibDate(), week = questWeekStart(date), d = questDailyFor(member, date), w = questWeeklyFor(member, week), q = questDataFor(member);
            const dailyCount = questDailyCompletedCount(member);
            const dailyStars = questSafeInteger(d.stars), dailyPurchases = questSafeInteger(d.shopPurchases), dailyMinutes = questSafeInteger(d.minutes);
            const weeklyStars = questSafeInteger(w.stars), weeklyPurchases = questSafeInteger(w.shopPurchases), weeklyMinutes = questSafeInteger(w.minutes);
            const memberStars = questSafeInteger(member.bintang), loginStreak = questSafeInteger(q.loginStreak);
            const daily = [
                {id:'chat', icon:'💬', title:'Aktif Mengobrol', desc:'Kirim minimal 1 chat yang berhasil terkirim hari ini.', reward:'50 diamond', done:!!d.chatDone, diamond:50},
                {id:'stars', icon:'⭐', title:'Pemburu Bintang', desc:'Dapatkan 10 star baru hari ini.', reward:'200 diamond', progress:dailyStars, target:10, done:dailyStars>=10, diamond:200},
                {id:'shop', icon:'🛒', title:'Pembeli Aktif', desc:'Beli minimal 1 item dari Shop Resmi hari ini.', reward:'100 diamond', progress:dailyPurchases, target:1, done:dailyPurchases>=1, diamond:100},
                {id:'time', icon:'⏱️', title:'Luangkan Waktu', desc:'Berada di website selama 10 menit. Waktu dihitung saat login dan website terbuka, termasuk ketika AFK.', reward:'100 diamond', progress:dailyMinutes, target:10, done:dailyMinutes>=10, diamond:100},
                {id:'all', icon:'🎁', title:'Penyelesaian Harian', desc:'Selesaikan keempat misi harian lainnya hari ini.', reward:'200 diamond bonus', done:!!d.chatDone && dailyStars>=10 && dailyPurchases>=1 && dailyMinutes>=10, diamond:200}
            ];
            const weekly = [
                {id:'daily10', icon:'📋', title:'Rajin Menyelesaikan Misi', desc:'Selesaikan 10 misi harian selama minggu ini.', reward:'300 diamond', progress:dailyCount, target:10, done:dailyCount>=10, diamond:300},
                {id:'stars50', icon:'⭐', title:'Kolektor Bintang', desc:'Dapatkan 50 star baru selama minggu ini.', reward:'500 diamond', progress:weeklyStars, target:50, done:weeklyStars>=50, diamond:500},
                {id:'time60', icon:'⏱️', title:'Betah di Ruang Mabar', desc:'Habiskan 60 menit di website selama minggu ini, termasuk waktu AFK saat login.', reward:'500 diamond', progress:weeklyMinutes, target:60, done:weeklyMinutes>=60, diamond:500},
                {id:'shop3', icon:'🛍️', title:'Pembeli Mingguan', desc:'Beli 3 item dari Shop Resmi selama minggu ini.', reward:'300 diamond', progress:weeklyPurchases, target:3, done:weeklyPurchases>=3, diamond:300},
                {id:'login7', icon:'📅', title:'Login 7 Hari', desc:'Login selama 7 hari berturut-turut.', reward:'500 diamond + 5 star', progress:loginStreak, target:7, done:loginStreak>=7, diamond:500, star:5}
            ];
            const special = [
                {id:'star100', icon:'🥉', title:'Bintang 100', desc:'Capai total 100 star pada akunmu.', reward:'300 diamond', done:memberStars>=100, diamond:300},
                {id:'star250', icon:'🥈', title:'Bintang 250', desc:'Capai total 250 star pada akunmu.', reward:'500 diamond', done:memberStars>=250, diamond:500},
                {id:'star500', icon:'🥇', title:'Bintang 500', desc:'Capai total 500 star pada akunmu.', reward:'1.000 diamond', done:memberStars>=500, diamond:1000}
            ];
            const eventActive = !!(globalSeasonEventData && Number(globalSeasonEventData.startAt) <= Date.now() && Date.now() < Number(globalSeasonEventData.endsAt));
            const eventLoginToday = !!(q.loginDates && q.loginDates[date]);
            // Hitung hari event berdasarkan tanggal WIB agar hari pertama tetap tersedia meski event diaktifkan bukan pukul 00.00.
            const eventStartDate = eventActive ? questWibDate(Number(globalSeasonEventData.startAt)) : '';
            const eventDay = eventActive ? Math.floor((Date.parse(date + 'T00:00:00Z') - Date.parse(eventStartDate + 'T00:00:00Z')) / 86400000) + 1 : 0;
            if (eventActive && eventDay >= 1 && eventDay <= 14) {
                special.push({id:'playTicketDaily', icon:'🎟️', title:'Login Harian Event', desc:`Login pada hari ke-${eventDay} Event Season untuk mendapatkan 1 Play Tiket. Wajib login setiap hari selama 14 hari; maksimal 14 tiket.`, reward:'1 Play Tiket', done:eventLoginToday, ticketReward:1, dailyTicket:true});
            }
            return {daily, weekly, special, date, week};
        }
        function renderQuestCard(type, quest, claimed, period) {
            const safeProgress = Number.isFinite(quest.progress) ? Math.max(0, quest.progress) : 0;
            const safeTarget = Number.isSafeInteger(quest.target) && quest.target > 0 ? quest.target : 0;
            const hasProgress = safeTarget > 0;
            const progress = hasProgress ? Math.max(0, Math.min(100, safeProgress / safeTarget * 100)) : (quest.done ? 100 : 0);
            const progressText = hasProgress ? `${Math.min(safeProgress, safeTarget)}/${safeTarget}` : (quest.done ? 'Selesai' : 'Belum selesai');
            const status = claimed ? 'Sudah diklaim' : (quest.done ? 'Siap diklaim' : 'Belum selesai');
            const disabled = claimed || !quest.done;
            return `<div class="quest-card"><div class="quest-card-head"><div class="quest-card-icon" aria-hidden="true">${quest.icon}</div><div class="quest-card-copy"><h4>${quest.title}</h4><p>${quest.desc}</p><div class="quest-reward">🎁 Hadiah: ${quest.reward}</div></div></div>${hasProgress ? `<div class="quest-progress"><span style="width:${progress}%"></span></div>` : ''}<div class="quest-card-foot"><span class="quest-progress-label">${progressText} · ${status}</span><button class="quest-claim-btn" ${disabled?'disabled':''} onclick="claimQuest('${type}','${quest.id}','${period}')">${claimed?'Sudah diklaim':(quest.done?'Klaim hadiah':'Belum selesai')}</button></div></div>`;
        }
        function renderQuestUI() {
            const required = document.getElementById('quest-login-required');
            if (!required) return;
            if (!activeLoggedInMemberKey || !globalMembersData[activeLoggedInMemberKey]) {
                required.style.display = 'block';
                ['daily','weekly','special'].forEach(k => { const el=document.getElementById('quest-panel-'+k); if(el) el.innerHTML=''; });
                return;
            }
            required.style.display = 'none';
            const member = globalMembersData[activeLoggedInMemberKey], defs = questDefinitions(member);
            const d = questDailyFor(member, defs.date), w = questWeeklyFor(member, defs.week), q = questDataFor(member);
            const dailyClaims = d.claimed || {}, weeklyClaims = w.claimed || {}, specialClaims = q.specialClaimed || {}, ticketClaims = q.playTicketClaims || {};
            document.getElementById('quest-panel-daily').innerHTML = `<div class="quest-top-note">🌞 Reset setiap hari pukul 00.00 WIB. Progres hari ini: ${defs.daily.filter(x=>x.done && x.id!=='all').length}/4 misi utama selesai.</div>${defs.daily.map(x=>renderQuestCard('daily',x,!!dailyClaims[x.id],defs.date)).join('')}`;
            document.getElementById('quest-panel-weekly').innerHTML = `<div class="quest-top-note">📅 Periode minggu ini: ${defs.week} sampai ${questWeekEnd(defs.week)} (batas akhir sebelum tanggal tersebut), WIB.</div>${defs.weekly.map(x=>renderQuestCard('weekly',x,!!weeklyClaims[x.id],defs.week)).join('')}`;
            document.getElementById('quest-panel-special').innerHTML = `<div class="quest-top-note">🏆 Misi pencapaian dan misi login harian Event Season.</div>${defs.special.map(x=>renderQuestCard('special',x, x.dailyTicket ? !!ticketClaims[defs.date] : !!specialClaims[x.id], x.dailyTicket ? defs.date : 'lifetime')).join('')}`;
        }
        function switchQuestTab(name, button) {
            document.querySelectorAll('.quest-subtab').forEach(b=>b.classList.remove('active'));
            document.querySelectorAll('.quest-panel').forEach(p=>p.classList.remove('active'));
            if (button) button.classList.add('active');
            const panel = document.getElementById('quest-panel-'+name); if(panel) panel.classList.add('active');
        }
        function claimQuest(type, id, period) {
            const key = activeLoggedInMemberKey;
            if (!key) { alert('Silakan login terlebih dahulu!'); switchTab('personal'); return; }
            if (!['daily', 'weekly', 'special'].includes(type) || typeof id !== 'string' || !id || typeof period !== 'string' || !period) {
                alert('Data Quest tidak valid. Silakan muat ulang halaman.');
                return;
            }
            const memberRef = database.ref(`members/${key}`);
            memberRef.transaction(member => {
                if (!member) return;
                member.questData = member.questData || {};
                const q = member.questData;
                let quest = null, claimedObj = null;
                if (type === 'daily') {
                    const daily = questEnsureObject(q, 'daily');
                    const d = questEnsureObject(daily, period);
                    d.claimed = questEnsureObject(d, 'claimed'); claimedObj = d.claimed;
                    const fakeMember={...member,questData:q}; quest=questDefinitions(fakeMember).daily.find(x=>x.id===id);
                    if (period !== questWibDate()) return;
                } else if (type === 'weekly') {
                    const weekly = questEnsureObject(q, 'weekly');
                    const w = questEnsureObject(weekly, period);
                    w.claimed = questEnsureObject(w, 'claimed'); claimedObj = w.claimed;
                    const fakeMember={...member,questData:q}; quest=questDefinitions(fakeMember).weekly.find(x=>x.id===id);
                    if (period !== questWeekStart()) return;
                } else if (type === 'special') {
                    quest=questDefinitions(member).special.find(x=>x.id===id);
                    if (id === 'playTicketDaily') {
                        if (period !== questWibDate() || !quest || !quest.done) return;
                        q.playTicketClaims = questEnsureObject(q, 'playTicketClaims'); claimedObj = q.playTicketClaims;
                    } else {
                        q.specialClaimed = questEnsureObject(q, 'specialClaimed'); claimedObj = q.specialClaimed;
                    }
                }
                const claimKey = type === 'special' && id === 'playTicketDaily' ? period : id;
                if (!claimedObj || !quest || !quest.done || claimedObj[claimKey]) return;
                const currentDiamond = Number(member.diamond ?? 0);
                const diamondReward = questSafeInteger(quest.diamond);
                if (!Number.isSafeInteger(currentDiamond) || currentDiamond < 0 || !Number.isSafeInteger(currentDiamond + diamondReward)) return;
                let nextStars = null;
                if (quest.star) {
                    const currentStars = Number(member.bintang ?? 0), starReward = questSafeInteger(quest.star);
                    if (!Number.isSafeInteger(currentStars) || currentStars < 0 || !Number.isSafeInteger(currentStars + starReward)) return;
                    nextStars = currentStars + starReward;
                }
                let nextTickets = null;
                if (quest.ticketReward) {
                    const currentTickets = Number(member.playTickets ?? 0), ticketReward = questSafeInteger(quest.ticketReward);
                    if (!Number.isSafeInteger(currentTickets) || currentTickets < 0 || !Number.isSafeInteger(currentTickets + ticketReward)) return;
                    nextTickets = currentTickets + ticketReward;
                }
                claimedObj[claimKey] = true;
                member.diamond = currentDiamond + diamondReward;
                if (nextStars !== null) member.bintang = nextStars;
                if (nextTickets !== null) member.playTickets = nextTickets;
                return member;
            }, (error, committed) => {
                if (error) alert('Gagal mengklaim hadiah. Coba lagi.');
                else if (committed) alert(id === 'playTicketDaily' ? '🎟️ Kamu mendapatkan 1 Play Tiket!' : '🎉 Hadiah Quest berhasil diklaim!');
                else alert('Misi belum selesai atau hadiah sudah pernah diklaim.');
                if (committed && globalMembersData[key]) database.ref(`members/${key}`).once('value').then(snap => { if (snap.exists()) { globalMembersData[key] = snap.val(); updateMemberPersonalView(globalMembersData[key]); renderQuestUI(); } });
                renderQuestUI();
            }, false);
        }
