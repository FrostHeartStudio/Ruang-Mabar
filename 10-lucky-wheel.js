// Ruang Mabar module: 10-lucky-wheel.js
// Keep this file loaded in the order declared in index.html.
        // ARCADE & LUCKY WHEEL
        const wheelPrizes = [
            { id: "ocean_shiny", name: "Hiasan Ocean Abbys", label: "Ocean Shiny", chance: 2, color: "#F4434F", type: "hiasan_nama" },
            { id: "play_ticket_1", name: "1 Play Tiket", label: "Play Tiket", chance: 1.5, color: "#F2C400", type: "play_ticket", val: 1 },
            { id: "super_ticket_1", name: "1 Super Tiket", label: "Super Tiket", chance: 2, color: "#7C3AED", type: "super_ticket", val: 1 },
            { id: "aurora_cerah", name: "Hiasan Langit Malam", label: "Langit Malam", chance: 1, color: "#26B9E8", type: "hiasan_profil" },
            { id: "neon_matrix", name: "Hiasan Neon Matrix", label: "???", chance: 0.5, color: "#A94CEB", type: "hiasan_profil" },
            { id: "dm_300", name: "-300 Diamond", label: "-300 Diamond", chance: 1, color: "#6858F5", type: "diamond", val: -300 },
            { id: "dm_100", name: "Hadiah 100 Diamond", label: "+100 Diamond", chance: 5, color: "#8950F5", type: "diamond", val: 100 },
            { id: "dm_250", name: "Hadiah 250 Diamond", label: "+250 Diamond", chance: 3, color: "#19C85A", type: "diamond", val: 250 },
            { id: "dm_500", name: "Hadiah 500 Diamond", label: "+500 Diamond", chance: 1, color: "#FF990A", type: "diamond", val: 500 },
            { id: "dm_1000", name: "HADIAH BESAR! 1000 Diamond", label: "+1000 Diamond", chance: 0.1, color: "#16B9A7", type: "diamond", val: 1000 },
            { id: "star_10", name: "+10 Star", label: "+10 Star", chance: 2, color: "#4285F4", type: "star", val: 10 },
            { id: "star_2", name: "+2 Star", label: "+2 Star", chance: 15, color: "#F59E0B", type: "star", val: 2 },
            { id: "star_5", name: "+5 Star", label: "+5 Star", chance: 5, color: "#EAB900", type: "star", val: 5 },
            { id: "star_2", name: "Kamu kalah -2 Star", label: "-2 Star", chance: 10, color: "#0DBA83", type: "star", val: -2 },
            { id: "star_1", name: "Kamu Kalah -1 Star", label: "-1 Star", chance: 15, color: "#08B5CB", type: "star", val: -1}
        ];

        const superWheelPrizes = [
            { id: 'neon_matrix', name: 'Neon Matrix', label: 'Neon Matrix', chance: 5, color: '#22c55e', type: 'hiasan_profil' },
            { id: 'super_diamond_2000', name: '2000 Diamond', label: '2000 Diamond', chance: 0.5, color: '#38bdf8', type: 'diamond', val: 2000 },
            { id: 'super_dm_500', name: '-500 Diamond', label: '-500 Diamond', chance: 2, color: '#6858F5', type: 'diamond', val: -500 },
            { id: 'super_star_25', name: '+25 Star', label: '+25 Star', chance:1, color: '#f59e0b', type: 'star', val: 25},
            { id: 'star_20', name: '-20 Star', label: '-20 Star', chance: 2, color: '#EAB900', type: 'star', val: -20 },
            { id: 'rainbow_shiny', name: 'Hiasan Nama Prisma Shiny', label: 'Hiasan Pelangi', chance: 1, color: '#c084fc', type: 'hiasan_nama' },
            { id: 'debu_kosmik', name: 'Debu Kosmik', label: 'Debu Kosmik', chance: 10, color: '#6366f1', type: 'item' }
        ];

        let isSpinning = false;
        let currentWheelRotation = 0;
        const wheelStarUpdatePending = {};

        function openLuckyWheelModal() {
            document.getElementById('luckyWheelModal').style.display = 'flex';
            if (activeLoggedInMemberKey && globalMembersData[activeLoggedInMemberKey]) {
                const dm = globalMembersData[activeLoggedInMemberKey].diamond || 0;
                document.getElementById('luckyWheelUserDiamond').innerText = `💎 Diamond Kamu: ${dm}`;
            } else {
                document.getElementById('luckyWheelUserDiamond').innerText = `💎 Login untuk bermain`;
            }
            drawWheel();
        }

        function closeLuckyWheelModal() {
            document.getElementById('luckyWheelModal').style.display = 'none';
        }

        function drawWheel() {
            const canvas = document.getElementById('wheelCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const numPrizes = wheelPrizes.length;
            const arc = (2 * Math.PI) / numPrizes;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            wheelPrizes.forEach((prize, index) => {
                const angle = index * arc;
                ctx.beginPath();
                ctx.fillStyle = prize.color;
                ctx.moveTo(140, 140);
                ctx.arc(140, 140, 140, angle, angle + arc);
                ctx.lineTo(140, 140);
                ctx.fill();

                ctx.save();
                ctx.translate(140, 140);
                ctx.rotate(angle + arc / 2);
                ctx.textAlign = "right";
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 12px Poppins, sans-serif";
                ctx.fillText(prize.label, 130, 4);
                ctx.restore();
            });
        }

        async function spinWheel() {
            if (isSpinning) return;
            if (!activeLoggedInMemberKey) {
                alert("Login terlebih dahulu di tab Personalisasi untuk bermain!");
                switchTab('personal');
                return;
            }

            const memberKey = activeLoggedInMemberKey;
            const member = globalMembersData[memberKey];
            const diamonds = Number(member ? member.diamond : 0);

            if (diamonds < 50) {
                alert("💎 Diamond kamu tidak cukup untuk Spin (butuh 50 Diamond)!");
                return;
            }

            const spinButton = document.getElementById('btnSpinWheel');
            const resultMessage = document.getElementById('spinResultMessage');
            const originalButtonText = spinButton ? spinButton.innerHTML : '🎰 Spin Sekarang (50 💎)';
            const lockToken = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
            let databaseLockAcquired = false;

            // Kunci sinkron sebelum proses async dimulai agar klik beruntun tidak membuat spin baru.
            isSpinning = true;
            if (spinButton) {
                spinButton.disabled = true;
                spinButton.innerText = 'Memutar Roda';
                spinButton.style.background = '#9ca3af';
                spinButton.style.color = '#ffffff';
                spinButton.style.cursor = 'not-allowed';
            }
            if (resultMessage) resultMessage.innerText = '🌀 Memutar roda...';

            try {
                // Kunci lintas tab/perangkat di Firebase. Kunci lama dianggap kedaluwarsa setelah 15 detik.
                const lockRef = database.ref(`members/${memberKey}/wheelSpinLock`);
                const lockResult = await lockRef.transaction(current => {
                    if (current && current.lockedAt && (Date.now() - Number(current.lockedAt) < 15000)) return;
                    return { lockedAt: Date.now(), token: lockToken };
                });
                if (!lockResult.committed || !lockResult.snapshot || !lockResult.snapshot.val() || lockResult.snapshot.val().token !== lockToken) {
                    if (resultMessage) resultMessage.innerText = 'Spin sedang diproses. Tunggu sebentar ya.';
                    return;
                }
                databaseLockAcquired = true;

                // Periksa ulang saldo setelah memperoleh kunci.
                const diamondRef = database.ref(`members/${memberKey}/diamond`);
                const diamondSnap = await diamondRef.once('value');
                const latestDiamonds = Number(diamondSnap.val() || 0);
                if (latestDiamonds < 50) {
                    if (globalMembersData[memberKey]) globalMembersData[memberKey].diamond = latestDiamonds;
                    const diamondLabel = document.getElementById('luckyWheelUserDiamond');
                    if (diamondLabel && activeLoggedInMemberKey === memberKey) diamondLabel.innerText = `💎 Diamond Kamu: ${latestDiamonds}`;
                    if (resultMessage) resultMessage.innerText = '💎 Diamond kamu tidak cukup untuk Spin (butuh 50 Diamond)!';
                    return;
                }

                playUiSound('wheel');
                const totalChance = wheelPrizes.reduce((sum, p) => sum + p.chance, 0);
                let rand = Math.random() * totalChance;
                let winningIndex = 0;

                for (let i = 0; i < wheelPrizes.length; i++) {
                    if (rand < wheelPrizes[i].chance) {
                        winningIndex = i;
                        break;
                    }
                    rand -= wheelPrizes[i].chance;
                }

                const prize = wheelPrizes[winningIndex];
                const numPrizes = wheelPrizes.length;
                const arc = 360 / numPrizes;
                const prizeCenterAngle = (winningIndex * arc) + (arc / 2);
                let angleOffset = (270 - prizeCenterAngle) % 360;
                if (angleOffset < 0) angleOffset += 360;
                const currentBase = Math.ceil(currentWheelRotation / 360) * 360;
                currentWheelRotation = currentBase + (360 * 5) + angleOffset;
                const canvas = document.getElementById('wheelCanvas');
                canvas.style.transform = `rotate(${currentWheelRotation}deg)`;

                // Tombol tetap terkunci selama animasi dan penyimpanan hadiah.
                await new Promise(resolve => setTimeout(resolve, 3000));
                if (resultMessage) resultMessage.innerText = `🎉 Selamat! Kamu mendapatkan: ${prize.name}!`;

                let newDiamond = latestDiamonds - 50;
                const rewardUpdates = {};
                if (prize.type === 'diamond') {
                    newDiamond += Number(prize.val || 0);
                } else if (prize.type === 'super_ticket') {
                    const superTicketRef = database.ref(`members/${memberKey}/superTickets`);
                    const superTicketResult = await superTicketRef.transaction(current => Number(current || 0) + Number(prize.val || 1));
                    if (superTicketResult.committed && globalMembersData[memberKey]) { globalMembersData[memberKey].superTickets = Number(superTicketResult.snapshot.val() || 0); updateSuperTicketLabel(); }
                } else if (prize.type === 'play_ticket' || prize.type === 'item' && prize.id === 'play_ticket') {
                    const ticketRef = database.ref(`members/${memberKey}/playTickets`);
                    const ticketResult = await ticketRef.transaction(current => Number(current || 0) + Number(prize.val || prize.count || 1));
                    if (ticketResult.committed && globalMembersData[memberKey]) {
                        globalMembersData[memberKey].playTickets = Number(ticketResult.snapshot.val() || 0);
                        updateMemberPersonalView(globalMembersData[memberKey]);
                    }
                } else if (prize.type === 'star') {
                    const starRef = database.ref(`members/${memberKey}/bintang`);
                    const beforeSnap = await starRef.once('value');
                    const beforeStars = Number(beforeSnap.val() || 0);
                    wheelStarUpdatePending[memberKey] = true;
                    await starRef.set(beforeStars + Number(prize.val || 0));
                    const verifySnap = await starRef.once('value');
                    const verifiedStars = Number(verifySnap.val() || 0);
                    if (globalMembersData[memberKey]) globalMembersData[memberKey].bintang = verifiedStars;
                    lastKnownMemberStars[memberKey] = verifiedStars;
                    if (verifiedStars > beforeStars) await recordQuestStars(verifiedStars - beforeStars);
                } else if (prize.type === 'hiasan_nama') {
                    let unlockedH = getItemArray(member.unlockedHiasan);
                    if (!unlockedH.includes(prize.id)) unlockedH.push(prize.id);
                    rewardUpdates[`members/${memberKey}/unlockedHiasan`] = unlockedH;

                    let expiresAt = null;
                    if (prize.id === 'spesial_ungu') {
                        const now = Date.now();
                        const currentExp = (member.spesialUnguExpiresAt && member.spesialUnguExpiresAt > now) ? member.spesialUnguExpiresAt : now;
                        expiresAt = currentExp + (7 * 24 * 60 * 60 * 1000);
                        rewardUpdates[`members/${memberKey}/spesialUnguExpiresAt`] = expiresAt;
                    }
                    addItemToInventory(rewardUpdates, memberKey, member, {
                        itemId: prize.id,
                        itemName: prize.name,
                        itemType: 'Hiasan Nama',
                        isDuration: Boolean(expiresAt),
                        expiresAt: expiresAt,
                        count: 1
                    });
                } else if (prize.type === 'hiasan_profil') {
                    addItemToInventory(rewardUpdates, memberKey, member, {
                        itemId: prize.id,
                        itemName: prize.name,
                        itemType: 'Hiasan Profil',
                        count: 1
                    });
                } else if (prize.type === 'hiasan_detail_profil') {
                    const unlockedDetail = getItemArray(member.unlockedHiasanDetailProfil);
                    if (!unlockedDetail.includes(prize.id)) unlockedDetail.push(prize.id);
                    rewardUpdates[`members/${memberKey}/unlockedHiasanDetailProfil`] = unlockedDetail;
                }

                if (Object.keys(rewardUpdates).length) await database.ref().update(rewardUpdates);
                await diamondRef.set(newDiamond);
                if (globalMembersData[memberKey]) globalMembersData[memberKey].diamond = newDiamond;
                const diamondLabel = document.getElementById('luckyWheelUserDiamond');
                if (diamondLabel && activeLoggedInMemberKey === memberKey) diamondLabel.innerText = `💎 Diamond Kamu: ${newDiamond}`;
            } catch (err) {
                console.error('Lucky Wheel reward failed:', err);
                if (resultMessage) resultMessage.innerText = 'Hadiah belum berhasil disimpan. Silakan cek profil dan coba lagi.';
            } finally {
                wheelStarUpdatePending[memberKey] = false;
                if (databaseLockAcquired) {
                    try {
                        const lockRef = database.ref(`members/${memberKey}/wheelSpinLock`);
                        await lockRef.transaction(current => current && current.token === lockToken ? null : current);
                    } catch (lockErr) {
                        console.error('Lucky Wheel lock release failed:', lockErr);
                    }
                }
                isSpinning = false;
                if (spinButton) {
                    spinButton.disabled = false;
                    spinButton.innerHTML = originalButtonText;
                    spinButton.style.background = '';
                    spinButton.style.color = '';
                    spinButton.style.cursor = '';
                }
            }
        }
