// Ruang Mabar module: 02-admin-auth.js
// Keep this file loaded in the order declared in index.html.
        // AUTH ADMIN & POPULATE ADMIN DATA
        function submitAdminAuth() {
            const pass = document.getElementById('inputAdminAuthPass').value.trim();
            if (pass === "PRMADMIN123") {
                isAdminLoggedIn = true;
                renderArcadeLinks();
                document.getElementById('admin-login-sec').style.display = 'none';
                document.getElementById('admin-panel-sec').style.display = 'block';
                populateAdminMemberList();
                populateAdminShopList();
                populateAdminEventList();
                populateAdminChatList();
                populateAdminArcadeList();
                populateAdminCodeList();
                refreshLoanOffers();
                alert("✅ Terverifikasi sebagai Admin!");
            } else {
                alert(" Password Admin Salah!");
            }
        }

        function populateAdminMemberList() {
            const selectMember = document.getElementById('adminSelectMember');
            const selectAbsen = document.getElementById('adminAbsenMemberSelect');
            const deleteContainer = document.getElementById('admin-member-delete-list');
            
            if (selectMember) selectMember.innerHTML = '<option value="">-- Pilih Member --</option>';
            if (selectAbsen) selectAbsen.innerHTML = '<option value="">-- Pilih Member --</option>';
            if (deleteContainer) deleteContainer.innerHTML = '';

            Object.keys(globalMembersData).forEach(key => {
                const m = globalMembersData[key];
                if (selectMember) {
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.textContent = m.nama || key;
                    selectMember.appendChild(opt);
                }
                if (selectAbsen) {
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.textContent = m.nama || key;
                    selectAbsen.appendChild(opt);
                }
                if (deleteContainer) {
                    const row = document.createElement('div');
                    row.className = 'admin-member-row';
                    row.innerHTML = `<span><strong>${escapeHTML(m.nama)}</strong></span><button class="btn-del-mini" onclick="adminDeleteMember('${key}')">🗑️ Hapus</button>`;
                    deleteContainer.appendChild(row);
                }
            });
        }

        function updateAdminHighestRankFromStars() {
            const starsInput = document.getElementById('adminMemberBintangTertinggiSeasonLalu');
            const rankInput = document.getElementById('adminMemberRankTertinggiSeasonLalu');
            if (!starsInput || !rankInput) return;
            rankInput.value = getRankFromBintang(Number(starsInput.value || 0), 'Warrior');
        }

        function adminLoadMemberToForm() {
            const key = document.getElementById('adminSelectMember').value;
            if (!key || !globalMembersData[key]) {
                document.getElementById('adminMemberPin').value = '';
                document.getElementById('adminMemberRank').value = '';
                document.getElementById('adminMemberRankTertinggiSeasonLalu').value = '';
                document.getElementById('adminMemberBintangTertinggiSeasonLalu').value = 0;
                document.getElementById('adminMemberBintang').value = 0;
                document.getElementById('adminMemberDiamond').value = 0;
                document.getElementById('adminMemberLevel').value = 1;
                document.getElementById('adminMemberBoost').value = 1;
                return;
            }
            const m = globalMembersData[key];
            document.getElementById('adminMemberPin').value = m.pin || '';
            document.getElementById('adminMemberRank').value = m.rank || '';
            document.getElementById('adminMemberBintangTertinggiSeasonLalu').value = Number(m.bintangSeasonLalu ?? m.seasonLaluBintang ?? m.starsSeasonLalu ?? 0);
            updateAdminHighestRankFromStars();
            document.getElementById('adminMemberBintang').value = m.bintang || 0;
            document.getElementById('adminMemberDiamond').value = m.diamond || 0;
            document.getElementById('adminMemberLevel').value = m.level || 1;
            document.getElementById('adminMemberBoost').value = m.boost || 1;
        }

        function adminSaveMemberStats() {
            const key = document.getElementById('adminSelectMember').value;
            if (!key) {
                alert("Pilih member yang ingin diedit terlebih dahulu!");
                return;
            }
            const updates = {};
            updates[`members/${key}/rank`] = document.getElementById('adminMemberRank').value.trim();
            const highestStarsToSave = Math.max(0, Number(document.getElementById('adminMemberBintangTertinggiSeasonLalu').value || 0));
            updates[`members/${key}/rankTertinggiSeasonLalu`] = getRankFromBintang(highestStarsToSave, 'Warrior');
            updates[`members/${key}/bintangSeasonLalu`] = highestStarsToSave;
            updates[`members/${key}/bintang`] = Number(document.getElementById('adminMemberBintang').value || 0);
            updates[`members/${key}/diamond`] = Number(document.getElementById('adminMemberDiamond').value || 0);
            updates[`members/${key}/level`] = Number(document.getElementById('adminMemberLevel').value || 1);
            updates[`members/${key}/boost`] = Number(document.getElementById('adminMemberBoost').value || 1);

            alert("✅ Data member berhasil diperbarui!");
            database.ref().update(updates).catch(err => {
                alert("Gagal memperbarui member: " + err.message);
            });
        }

        function adminAddMember() {
            const name = prompt("Masukkan Nama Member Baru:");
            if (!name || !name.trim()) return;
            const newRef = membersRef.push();
            newRef.set({
                nama: name.trim(),
                pin: "1234",
                rank: "Warrior",
                bintang: 0,
                diamond: 0,
                level: 1,
                boost: 1,
                gelar: "-",
                bio: "Member Ruang Mabar",
                lencanaImmortal: false,
                lencanaProfil: ''
            });
            alert("✅ Member baru berhasil ditambahkan!");
        }

        function adminDeleteMember(key) {
            if (confirm("Yakin hapus member ini beserta datanya?")) {
                alert("✅ Member berhasil dihapus!");
                membersRef.child(key).remove();
            }
        }

        function redeemCodeReward() {
            if (!activeLoggedInMemberKey) {
                alert("Silakan login terlebih dahulu di tab Personalisasi sebelum klaim kode!");
                switchTab('personal');
                return;
            }

            const codeInput = document.getElementById('inputRedeemCode').value.trim().toUpperCase();
            document.getElementById('inputRedeemCode').value = '';
            if (!codeInput) {
                alert("Masukkan kode terlebih dahulu!");
                return;
            }

            const codeData = globalCodesData[codeInput];
            if (!codeData) {
                alert(" Kode tidak valid atau sudah kadaluarsa!");
                return;
            }

            const redeemMode = codeData.redeemMode || 'once';
            const member = globalMembersData[activeLoggedInMemberKey];
            const redeemedBy = codeData.redeemedBy || {};
            if (redeemedBy[activeLoggedInMemberKey]) {
                alert(" Kamu sudah pernah redeem kode ini! Kode hanya bisa digunakan 1x oleh akun yang sama.");
                return;
            }
            const updates = {};

            if (codeData.type === 'diamond') {
                updates[`members/${activeLoggedInMemberKey}/diamond`] = Number(member.diamond || 0) + Number(codeData.value);
            } else if (codeData.type === 'star') {
                updates[`members/${activeLoggedInMemberKey}/bintang`] = Number(member.bintang || 0) + Number(codeData.value);
            } else if (codeData.type === 'hiasan_nama') {
                addItemToInventory(updates, activeLoggedInMemberKey, member, { itemId: codeData.preset, itemType: 'Hiasan Nama' });
                stackItemDuration(updates, activeLoggedInMemberKey, member, codeData.preset, 7);
            } else if (codeData.type === 'hiasan_profil') {
                addItemToInventory(updates, activeLoggedInMemberKey, member, { itemId: codeData.preset, itemType: 'Hiasan Profil' });
                stackItemDuration(updates, activeLoggedInMemberKey, member, codeData.preset, 7);
            } else if (codeData.type === 'hiasan_detail_profil') {
                const unlockedDetail = getItemArray(member.unlockedHiasanDetailProfil);
                if (!unlockedDetail.includes(codeData.preset)) unlockedDetail.push(codeData.preset);
                updates[`members/${activeLoggedInMemberKey}/unlockedHiasanDetailProfil`] = unlockedDetail;
                stackItemDuration(updates, activeLoggedInMemberKey, member, codeData.preset, 7);
            } else if (codeData.type === 'kotak_nama') {
                const unlockedBoxes = getItemArray(member.unlockedKotakNama);
                if (!unlockedBoxes.includes(codeData.preset)) unlockedBoxes.push(codeData.preset);
                updates[`members/${activeLoggedInMemberKey}/unlockedKotakNama`] = unlockedBoxes;
                updates[`members/${activeLoggedInMemberKey}/kotakNama`] = codeData.preset;
                updates[`members/${activeLoggedInMemberKey}/itemExpiries/${codeData.preset}`] = null;
            } else if (codeData.type === 'lencana') {
                const unlockedBadges = getItemArray(member.unlockedBadges);
                if (!unlockedBadges.includes(codeData.preset)) unlockedBadges.push(codeData.preset);
                updates[`members/${activeLoggedInMemberKey}/unlockedBadges`] = unlockedBadges;
            } else if (codeData.type === 'vip_plus') {
                updates[`members/${activeLoggedInMemberKey}/isVip`] = true;
                updates[`members/${activeLoggedInMemberKey}/isVipPlus`] = true;
                updates[`members/${activeLoggedInMemberKey}/boost`] = Math.max(Number(member.boost || 1), 3);

                addItemToInventory(updates, activeLoggedInMemberKey, member, { itemId: 'vip_plus_gold', itemType: 'Hiasan Nama' });
                let unlockedP = getItemArray(member.unlockedHiasanProfil);
                unlockedP.push('vip_plus_gold');
                updates[`members/${activeLoggedInMemberKey}/unlockedHiasanProfil`] = unlockedP;
                updates[`members/${activeLoggedInMemberKey}/hiasanProfil`] = 'vip_plus_gold';
                updates[`members/${activeLoggedInMemberKey}/hiasanDetailProfil`] = 'vip_plus_gold';
                let unlockedDetail = getItemArray(member.unlockedHiasanDetailProfil);
                if (!unlockedDetail.includes('vip_plus_gold')) unlockedDetail.push('vip_plus_gold');
                updates[`members/${activeLoggedInMemberKey}/unlockedHiasanDetailProfil`] = unlockedDetail;

                let unlockedT = getItemArray(member.unlockedTitles);
                unlockedT.push('VIP Plus Member');
                updates[`members/${activeLoggedInMemberKey}/unlockedTitles`] = unlockedT;
                updates[`members/${activeLoggedInMemberKey}/gelar`] = 'VIP Plus Member';
            } else if (codeData.type === 'gelar') {
                const gelar = String(codeData.gelar || '').trim();
                if (gelar) {
                    const unlockedT = getItemArray(member.unlockedTitles);
                    unlockedT.push(gelar);
                    updates[`members/${activeLoggedInMemberKey}/unlockedTitles`] = unlockedT;
                    updates[`members/${activeLoggedInMemberKey}/gelar`] = gelar;
                }
            }

            if (redeemMode === 'once') {
                updates[`codes/${codeInput}`] = null;
            } else {
                updates[`codes/${codeInput}/redeemedBy/${activeLoggedInMemberKey}`] = true;
            }

            const modeText = redeemMode === 'unlimited' ? 'tak terbatas' : '1x';
            alert(`🎉 Berhasil klaim kode reward: ${codeData.label || codeInput}!\nMode redeem: ${modeText}.`);
            database.ref().update(updates);
        }
