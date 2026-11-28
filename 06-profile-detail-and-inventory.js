// Ruang Mabar module: 06-profile-detail-and-inventory.js
// Keep this file loaded in the order declared in index.html.
        // BUKA DETAIL PROFIL MODAL DENGAN MASA AKTIF SHINY DAN EMOJI VARIATIF
        function renderProfileDetailModalContent(key) {
            const member = globalMembersData[key];
            if (!member) return;

            const content = document.getElementById('profileDetailContent');
            if (!content) return;

            let nameClass = "member-name";
            if (member.hiasanNama === 'vip_plus_gold' && hasActiveVipPlus(member)) {
                nameClass = "member-name name-vip-plus-gold";
            } else if (member.hiasanNama === 'vip_gold') {
                nameClass = "member-name name-gold-shiny";
            } else if (member.hiasanNama === 'limited_shiny') {
                nameClass = "member-name name-green-shiny";
            } else if (member.hiasanNama === 'spesial_ungu') {
                nameClass = "member-name name-purple-shiny";
            } else if (member.hiasanNama === 'keberuntungan') {
                nameClass = "member-name name-red-shiny";
            } else if (member.hiasanNama === 'terpilih') {
                nameClass = "member-name name-diamond-shiny";
            }
            else if (hiasanNamaClassMap[member.hiasanNama]) {
                nameClass = "member-name " + hiasanNamaClassMap[member.hiasanNama];
            }

            let hiasanNamaText = 'Default';
            if (member.hiasanNama && hiasanNamaMap[member.hiasanNama]) {
                hiasanNamaText = hiasanNamaMap[member.hiasanNama];
            } else if (member.hiasanNama && member.hiasanNama !== 'default') {
                hiasanNamaText = member.hiasanNama;
            }

            let hiasanProfilText = 'Default (Putih)';
            if (member.hiasanProfil && hiasanProfilMap[member.hiasanProfil]) {
                hiasanProfilText = hiasanProfilMap[member.hiasanProfil];
            } else if (member.hiasanProfil && member.hiasanProfil !== 'default') {
                hiasanProfilText = member.hiasanProfil;
            }

            const calculatedRank = getRankFromBintang(member.bintang, member.rank);

            let durationItemsHTML = '';
            const now = Date.now();
            let hasDurationItem = false;

            if (member.itemExpiries) {
                Object.keys(member.itemExpiries).forEach(itemId => {
                    const exp = Number(member.itemExpiries[itemId]);
                    if (exp > now) {
                        hasDurationItem = true;
                        const diffMs = exp - now;
                        const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const timeStr = daysLeft > 0 ? `${daysLeft} Hari ${hoursLeft} Jam` : `${hoursLeft} Jam`;
                        
                        let itemName = itemId;
                        if (hiasanNamaMap[itemId]) itemName = hiasanNamaMap[itemId];
                        else if (hiasanProfilMap[itemId]) itemName = hiasanProfilMap[itemId];
                        else if (hiasanDetailProfilMap[itemId]) itemName = hiasanDetailProfilMap[itemId];

                        const emoji = getItemDurationEmoji(itemId);
                        const shinyClass = getItemDurationShinyClass(itemId);

                        durationItemsHTML += `<div style="margin-bottom: 6px; font-size: 0.88rem; display: flex; justify-content: space-between; align-items: center;">
                            <span class="${shinyClass}">${emoji} ${escapeHTML(itemName)}</span>
                            <span class="${shinyClass}">${timeStr}</span>
                        </div>`;
                    }
                });
            }

            if (!hasDurationItem) {
                durationItemsHTML = `<div style="color: #64748b; font-style: italic; font-size: 0.85rem;">Tidak ada hiasan/status berdurasi</div>`;
            }

            let isGelarVipPlus = (member.gelar && member.gelar.toLowerCase().includes('vip plus'));
            let isGelarVip = (member.gelar && member.gelar.toLowerCase().includes('vip'));
            const gelarClass = isGelarVipPlus ? "member-gelar vip-plus" : (isGelarVip ? "member-gelar vip" : "member-gelar");
            const gelarHTML = (member.gelar && member.gelar !== '-') ? `<span class="${gelarClass}">${escapeHTML(member.gelar)}</span>` : '<span style="color:#94a3b8;">-</span>';
            const isOnline = member.onlineStatus === true;
            const statusHTML = isOnline
                ? '<div style="margin-top: 8px; font-size: 0.88rem; font-weight: 700; color: #16a34a;">🟢 Online</div>'
                : '<div style="margin-top: 8px; font-size: 0.88rem; font-weight: 700; color: #64748b;">⚫ Offline</div>';

            const activeDetailId = member.hiasanDetailProfil || 'default';
            let hiasanDetailText = 'Default (Putih)';
            if (activeDetailId !== 'default' && hiasanDetailProfilMap[activeDetailId]) {
                hiasanDetailText = hiasanDetailProfilMap[activeDetailId];
            } else if (activeDetailId !== 'default') {
                hiasanDetailText = activeDetailId;
            }
            const detailClass = activeDetailId === 'vip_plus_gold' && !hasActiveVipPlus(member) ? '' : (hiasanDetailClassMap[activeDetailId] || '');
            const detailCardStart = detailClass ? `<div class="${detailClass}">` : '';
            const detailCardEnd = detailClass ? '</div>' : '';

            content.innerHTML = `
                ${detailCardStart}
                <div style="text-align: center; margin-bottom: 16px;">
                    <h3 style="font-size: 1.2rem; margin-bottom: 4px;">
                        ${renderPlayerNameWithBox(member, nameClass, member.nama || 'Anggota', 'font-size:1.25rem;')}
                    </h3>
                    <div>Gelar: ${gelarHTML}</div>
                    ${statusHTML}
                </div>

                <div class="stats-grid" style="margin-bottom: 16px;">
                    <div class="stat-item">🏆 Rank: ${escapeHTML(calculatedRank)}</div>
                    <div class="stat-item">⭐ Bintang: ${member.bintang || 0}</div>
                    <div class="stat-item">💎 Diamond: ${member.diamond || 0}</div>
                    <div class="stat-item">⚡ Boost: ${member.boost || 1}x</div>
                    <div class="stat-item" style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">📊 Level: ${member.level || 1}${getProfileBadgesHTML(member) ? ` ${getProfileBadgesHTML(member)}` : ''}</div>
                    <div class="stat-item">🎮 Game: ${escapeHTML(member.gameKesukaan || '-')}</div>
                    <div class="stat-item">🏅 Rank Tertinggi: ${escapeHTML(getRankFromBintang(Number(member.bintangSeasonLalu ?? member.seasonLaluBintang ?? member.starsSeasonLalu ?? 0), 'Warrior'))}</div>
                    <div class="stat-item">⭐ Bintang Tertinggi: ${escapeHTML(String(member.bintangSeasonLalu ?? member.seasonLaluBintang ?? member.starsSeasonLalu ?? 0))}</div>
                </div>

                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
                    <div style="font-weight: 600; font-size: 0.85rem; color: #334155; margin-bottom: 4px;">📝 Bio:</div>
                    <div style="font-size: 0.85rem; color: #64748b; font-style: italic;">${escapeHTML(member.bio || '-')}</div>
                </div>

                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 14px;">
                    <div style="font-weight: 600; font-size: 0.85rem; color: #334155; margin-bottom: 6px;">🎨 Hiasan Digunakan:</div>
                    <div style="font-size: 0.82rem; color: #475569; display: flex; flex-direction: column; gap: 4px;">
                        <div>✨ Hiasan Nama: <strong>${escapeHTML(hiasanNamaText)}</strong></div>
                        <div>🖼️ Hiasan Profil: <strong>${escapeHTML(hiasanProfilText)}</strong></div>
                        <div>🎨 Hiasan Detail Profil: <strong>${escapeHTML(hiasanDetailText)}</strong></div>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #cbd5e1;">
                    <div style="font-weight: 700; font-size: 0.88rem; color: #0f172a; margin-bottom: 8px;">⏳ Hiasan & Status Berdurasi</div>
                    <div>
                        ${durationItemsHTML}
                    </div>
                </div>
                ${detailCardEnd}
            `;

            const detailModal = document.getElementById('profileDetailModal');
            if (detailModal) {
                detailModal.style.display = 'flex';
                detailModal.style.zIndex = '10000';
            }
        }

        // RENDER INVENTORY SESUAI FORMAT YANG DIMINTA
        function hasActiveVipPlus(member) {
            if (!member) return false;
            const exp = Number(member.itemExpiries && member.itemExpiries.vip_plus_gold || 0);
            // Expiry yang tercatat harus masih aktif; tanpa expiry berarti permanen jika dimiliki.
            if (exp) return exp > Date.now();
            return !!member.isVipPlus || getItemArray(member.unlockedHiasan).includes('vip_plus_gold') || getItemArray(member.unlockedHiasanProfil).includes('vip_plus_gold') || getItemArray(member.unlockedHiasanDetailProfil).includes('vip_plus_gold');
        }

        function isItemAvailable(member, itemId) {
            if (!member || !itemId) return false;
            const expiries = member.itemExpiries || {};
            const exp = Number(expiries[itemId] || 0);
            return !exp || exp > Date.now();
        }

        function clearExpiredVipPlusState(updates, memberKey, member) {
            if (!member || !member.isVipPlus) return;
            const exp = Number(member.itemExpiries && member.itemExpiries.vip_plus_gold || 0);
            if (exp && exp <= Date.now()) {
                updates[`members/${memberKey}/isVip`] = false;
                updates[`members/${memberKey}/isVipPlus`] = false;
                updates[`members/${memberKey}/boost`] = Math.max(1, Math.min(Number(member.boost || 1), 2));
                if (member.hiasanNama === 'vip_plus_gold') updates[`members/${memberKey}/hiasanNama`] = 'default';
                if (member.hiasanProfil === 'vip_plus_gold') updates[`members/${memberKey}/hiasanProfil`] = 'default';
                if (member.hiasanDetailProfil === 'vip_plus_gold') updates[`members/${memberKey}/hiasanDetailProfil`] = 'default';
                if (member.gelar === 'VIP Plus Member') updates[`members/${memberKey}/gelar`] = '-';
            }
        }

        function getGalleryInventory(member) {
            if (!member) return [];
            const result = [];
            const addCategory = (prefix, field, nameMap) => {
                const counts = getItemCounts(getItemArray(member[field]).filter(id => isItemAvailable(member, id)));
                Object.keys(counts).forEach(id => result.push({ key: `${prefix}:${id}`, name: nameMap[id] || id, count: counts[id] }));
            };
            addCategory('nama', 'unlockedHiasan', hiasanNamaMap);
            addCategory('profil', 'unlockedHiasanProfil', hiasanProfilMap);
            addCategory('detail', 'unlockedHiasanDetailProfil', hiasanDetailProfilMap);
            addCategory('kotak', 'unlockedKotakNama', { royal: 'Kotak Nama Royal', neon: 'Kotak Nama Neon', frost: 'Kotak Nama Frost', nature: 'Kotak Nama Nature', cosmic: 'Kotak Nama Cosmic', halloween_candy_box: 'Candy Basket' });
            addCategory('gelar', 'unlockedTitles', {});
            const ticketCount = Math.max(0, Number(member.playTickets || 0));
            if (ticketCount > 0) result.push({ key: 'item:play_ticket', name: 'Play Tiket', count: ticketCount });
            addCategory('lencana', 'unlockedBadges', { immortal: 'Immortal', demon_king: 'Demon King', first_season: 'First Season', halloween_candy_hunter: 'Candy Hunter' });
            if (member.isVip || hasActiveVipPlus(member)) result.push({ key: 'status:vip', name: hasActiveVipPlus(member) ? 'VIP Plus Member Status' : 'VIP Member Status', count: 1 });
            return result;
        }

        function refreshGalleryOptionChecks(select) {
            if (!select) return;
            Array.from(select.options).forEach(option => {
                const baseText = (option.dataset.baseLabel || option.textContent).replace(/^✓\s*/, '');
                option.dataset.baseLabel = baseText;
                option.textContent = `${option.selected ? '✓ ' : '　'}${baseText}`;
            });
        }

        function limitGallerySelection(select) {
            const selected = Array.from(select.options).filter(option => option.selected);
            if (selected.length > 10) {
                selected.slice(10).forEach(option => option.selected = false);
                showResultPopup('Galeri hanya bisa menampilkan maksimal 10 item.');
            }
            refreshGalleryOptionChecks(select);
        }

        function openPlayerGallery(key) {
            const member = globalMembersData[key];
            const content = document.getElementById('playerGalleryContent');
            if (!member || !content) return;
            const inventory = getGalleryInventory(member);
            const selected = Array.isArray(member.galleryItems) ? member.galleryItems : [];
            const selectedItems = selected.map(k => inventory.find(item => item.key === k)).filter(Boolean);
            content.innerHTML = selectedItems.length ? selectedItems.map(item => {
                const itemId = item.key.split(':').pop();
                const shinyClass = getItemDurationShinyClass(itemId);
                const emoji = getItemDurationEmoji(itemId);
                return `<div style="font-size:.85rem;font-weight:700;margin-top:4px;display:flex;align-items:center;gap:4px;"><span class="${shinyClass}">${emoji} ${escapeHTML(item.name)} (${item.count}x)</span></div>`;
            }).join('') : '<div style="font-size:.88rem;color:#64748b;text-align:center;padding:12px;">Belum ada item yang dipajang.</div>';
            const modal = document.getElementById('playerGalleryModal');
            modal.style.display = 'flex';
            modal.style.zIndex = '10001';
        }

        function updateMemberPersonalView(member) {
            if (!member) return;
            activeLoggedInMemberKey = activeLoggedInMemberKey || document.getElementById('selectMemberSelf').value;
            const expiredVipUpdates = {};
            clearExpiredVipPlusState(expiredVipUpdates, activeLoggedInMemberKey, member);
            if (Object.keys(expiredVipUpdates).length) database.ref().update(expiredVipUpdates);

            document.getElementById('editSelfNama').value = member.nama || '';
            const hiasanDetailProfilSelect = document.getElementById('editSelfHiasanDetailProfilSelect');
            if (hiasanDetailProfilSelect) {
                hiasanDetailProfilSelect.innerHTML = '<option value="default">Default (Putih)</option>';
                const unlockedDetail = [...new Set(getItemArray(member.unlockedHiasanDetailProfil).filter(id => isItemAvailable(member, id)))];
                unlockedDetail.forEach(id => {
                    const opt = document.createElement('option');
                    opt.value = id;
                    opt.textContent = hiasanDetailProfilMap[id] || id;
                    if (id === 'vip_plus_gold' && !hasActiveVipPlus(member)) opt.disabled = true;
                    hiasanDetailProfilSelect.appendChild(opt);
                });
                hiasanDetailProfilSelect.value = unlockedDetail.includes(member.hiasanDetailProfil) ? member.hiasanDetailProfil : 'default';
            }
            document.getElementById('editSelfBio').value = member.bio || '';
            document.getElementById('editSelfGameKesukaan').value = member.gameKesukaan || '';

            const badgeSelect = document.getElementById('editSelfBadgeSelect');
            if (badgeSelect) {
                badgeSelect.innerHTML = '<option value="">-- Tanpa Lencana --</option>';
                const badgeCatalog = {
                    immortal: '🏅 Immortal',
                    demon_king: '🌙 Demon King',
                    first_season: '🌟 First Season',
                    halloween_candy_hunter: '🍬 Candy Hunter'
                };
                const earnedBadges = [...new Set(getItemArray(member.unlockedBadges))];
                const legacyBadges = Array.isArray(member.lencanaProfil) ? member.lencanaProfil : (member.lencanaProfil ? [member.lencanaProfil] : (member.lencanaImmortal ? ['immortal'] : []));
                [...new Set([...earnedBadges, ...legacyBadges, ...(member.lencanaImmortal ? ['immortal'] : [])])].filter(id => badgeCatalog[id]).forEach(id => {
                    const opt = document.createElement('option');
                    opt.value = id;
                    opt.textContent = badgeCatalog[id];
                    badgeSelect.appendChild(opt);
                });
                const selectedBadge = Array.isArray(member.lencanaDitampilkan) ? (member.lencanaDitampilkan[0] || '') : (member.lencanaDitampilkan ?? (Array.isArray(member.lencanaProfil) ? (member.lencanaProfil[0] || '') : (member.lencanaProfil || (member.lencanaImmortal ? 'immortal' : ''))));
                badgeSelect.value = [...badgeSelect.options].some(opt => opt.value === selectedBadge) ? selectedBadge : '';
            }

            const gallerySelect = document.getElementById('editSelfGalleryItems');
            if (gallerySelect) {
                const galleryInventory = getGalleryInventory(member);
                const selectedGalleryItems = Array.isArray(member.galleryItems) ? member.galleryItems : [];
                gallerySelect.innerHTML = '';
                galleryInventory.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.key;
                    opt.dataset.baseLabel = `${item.name} (${item.count}x)`;
                    opt.textContent = `${item.name} (${item.count}x)`;
                    opt.selected = selectedGalleryItems.includes(item.key);
                    gallerySelect.appendChild(opt);
                });
                refreshGalleryOptionChecks(gallerySelect);
            }

            const gelarSelect = document.getElementById('editSelfGelarSelect');
            gelarSelect.innerHTML = '<option value="-">Tanpa Gelar (-)</option>';
            const titles = getItemArray(member.unlockedTitles).filter(title => isItemAvailable(member, title));
            titles.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t; opt.textContent = t;
                if (member.gelar === t) opt.selected = true;
                gelarSelect.appendChild(opt);
            });

            const hiasanNamaSelect = document.getElementById('editSelfHiasanNamaSelect');
            hiasanNamaSelect.innerHTML = '<option value="default">Default</option>';
            const unlockedH = getItemArray(member.unlockedHiasan).filter(id => isItemAvailable(member, id) && (id !== 'vip_plus_gold' || hasActiveVipPlus(member)));
            [...new Set(unlockedH)].forEach(id => {
                const opt = document.createElement('option');
                opt.value = id; opt.textContent = hiasanNamaMap[id] || id;
                if (member.hiasanNama === id) opt.selected = true;
                hiasanNamaSelect.appendChild(opt);
            });

            const kotakNamaSelect = document.getElementById('editSelfKotakNamaSelect');
            if (kotakNamaSelect) {
                const boxNames = { royal: 'Kotak Nama Royal', neon: 'Kotak Nama Neon', frost: 'Kotak Nama Frost', nature: 'Kotak Nama Nature', cosmic: 'Kotak Nama Cosmic', halloween_candy_box: 'Candy Basket' };
                const ownedBoxes = [...new Set(getItemArray(member.unlockedKotakNama).filter(id => Object.prototype.hasOwnProperty.call(boxNames, id) && isItemAvailable(member, id)))];
                const currentBox = ownedBoxes.includes(member.kotakNama) ? member.kotakNama : 'default';
                kotakNamaSelect.innerHTML = '<option value="default">Default (Tanpa Kotak)</option>' + ownedBoxes.map(id => `<option value="${id}">${boxNames[id]}</option>`).join('');
                kotakNamaSelect.value = currentBox;
            }

            const hiasanProfilSelect = document.getElementById('editSelfHiasanProfilSelect');
            hiasanProfilSelect.innerHTML = '<option value="default">Default (Putih)</option>';
            const unlockedP = getItemArray(member.unlockedHiasanProfil).filter(id => isItemAvailable(member, id) && (id !== 'vip_plus_gold' || hasActiveVipPlus(member)));
            [...new Set(unlockedP)].forEach(id => {
                const opt = document.createElement('option');
                opt.value = id; opt.textContent = hiasanProfilMap[id] || id;
                if (member.hiasanProfil === id) opt.selected = true;
                hiasanProfilSelect.appendChild(opt);
            });

            // FORMATTING INVENTORY
            const ownedContainer = document.getElementById('owned-items-list');
            if (ownedContainer) {
                let html = '';
                const playTicketCount = Math.max(0, Number(member.playTickets || 0));
                if (playTicketCount > 0) {
                    html += `<div style="font-weight:700;color:#0f172a;margin-top:4px;margin-bottom:2px;">• Item</div><div style="padding-left:8px;color:#334155;">- "Play Tiket" (${playTicketCount}x)</div>`;
                }

                // Hiasan Nama
                const hiasanNamaCounts = getItemCounts(getItemArray(member.unlockedHiasan).filter(id => isItemAvailable(member, id)));
                const hiasanNamaKeys = Object.keys(hiasanNamaCounts);
                if (hiasanNamaKeys.length > 0) {
                    html += `<div style="font-weight: 700; color: #0f172a; margin-top: 4px; margin-bottom: 2px;">• Hiasan Nama</div>`;
                    hiasanNamaKeys.forEach(id => {
                        const name = hiasanNamaMap[id] || id;
                        const count = hiasanNamaCounts[id];
                        html += `<div style="padding-left: 8px; color: #334155;">- "${escapeHTML(name)}" (${count}x)</div>`;
                    });
                }

                // Hiasan Profil
                const hiasanProfilCounts = getItemCounts(getItemArray(member.unlockedHiasanProfil).filter(id => isItemAvailable(member, id)));
                const hiasanProfilKeys = Object.keys(hiasanProfilCounts);
                if (hiasanProfilKeys.length > 0) {
                    html += `<div style="font-weight: 700; color: #0f172a; margin-top: 8px; margin-bottom: 2px;">• Hiasan Profil</div>`;
                    hiasanProfilKeys.forEach(id => {
                        const name = hiasanProfilMap[id] || id;
                        const count = hiasanProfilCounts[id];
                        html += `<div style="padding-left: 8px; color: #334155;">- "${escapeHTML(name)}" (${count}x)</div>`;
                    });
                }

                // Hiasan Detail Profil
                const hiasanDetailCounts = getItemCounts(getItemArray(member.unlockedHiasanDetailProfil).filter(id => isItemAvailable(member, id)));
                const hiasanDetailKeys = Object.keys(hiasanDetailCounts);
                if (hiasanDetailKeys.length > 0) {
                    html += `<div style="font-weight: 700; color: #0f172a; margin-top: 8px; margin-bottom: 2px;">• Hiasan Detail Profil</div>`;
                    hiasanDetailKeys.forEach(id => {
                        const name = hiasanDetailProfilMap[id] || id;
                        html += `<div style="padding-left: 8px; color: #334155;">- "${escapeHTML(name)}" (${hiasanDetailCounts[id]}x)</div>`;
                    });
                }

                // Kotak Nama
                const kotakNamaMap = { royal: 'Kotak Nama Royal', neon: 'Kotak Nama Neon', frost: 'Kotak Nama Frost', nature: 'Kotak Nama Nature', cosmic: 'Kotak Nama Cosmic', halloween_candy_box: 'Candy Basket' };
                const kotakNamaCounts = getItemCounts(getItemArray(member.unlockedKotakNama).filter(id => isItemAvailable(member, id)));
                const kotakNamaKeys = Object.keys(kotakNamaCounts);
                if (kotakNamaKeys.length > 0) {
                    html += `<div style="font-weight:700;color:#0f172a;margin-top:8px;margin-bottom:2px;">• Kotak Nama</div>`;
                    kotakNamaKeys.forEach(id => { html += `<div style="padding-left:8px;color:#334155;">- "${escapeHTML(kotakNamaMap[id] || id)}" (${kotakNamaCounts[id]}x)</div>`; });
                }

                // Gelar
                const gelarCounts = getItemCounts(getItemArray(member.unlockedTitles));
                const gelarKeys = Object.keys(gelarCounts);
                if (gelarKeys.length > 0) {
                    html += `<div style="font-weight: 700; color: #0f172a; margin-top: 8px; margin-bottom: 2px;">• Gelar</div>`;
                    gelarKeys.forEach(g => {
                        const count = gelarCounts[g];
                        html += `<div style="padding-left: 8px; color: #334155;">- "${escapeHTML(g)}" (${count}x)</div>`;
                    });
                }

                // Status VIP
                if (member.isVip || hasActiveVipPlus(member)) {
                    html += `<div style="font-weight: 700; color: #0f172a; margin-top: 8px; margin-bottom: 2px;">• Status Member</div>`;
                    if (hasActiveVipPlus(member)) {
                        html += `<div style="padding-left: 8px; color: #334155;">- "VIP Plus Member Status" (1x)</div>`;
                    } else {
                        html += `<div style="padding-left: 8px; color: #334155;">- "VIP Member Status" (1x)</div>`;
                    }
                }

                if (!html) html = 'Belum memiliki item apapun.';
                ownedContainer.innerHTML = html;
            }
        }

        async function createMemberAccount() {
            const name = document.getElementById('newAccountName').value.trim();
            const pin = document.getElementById('newAccountPin').value;
            const confirmPin = document.getElementById('newAccountPinConfirm').value;
            if (!name || !pin) return showResultPopup('Nama pengguna dan password wajib diisi.');
            if (name.length < 3) return showResultPopup('Nama pengguna minimal 3 karakter.');
            if (pin.length < 4) return showResultPopup('Password / PIN minimal 4 karakter.');
            if (pin !== confirmPin) return showResultPopup('Konfirmasi password tidak cocok.');
            if (Object.values(globalMembersData || {}).some(m => String(m.nama || m.username || '').trim().toLowerCase() === name.toLowerCase())) return showResultPopup('Nama pengguna sudah digunakan.');
            try {
                const ref = membersRef.push();
                const account = { nama: name, username: name, pin: pin, level: 1, diamond: 0, bintang: 0, gelar: '-', bio: '', createdAt: Date.now() };
                await ref.set(account);
                document.getElementById('selectMemberSelf').value = name;
                document.getElementById('inputMemberPin').value = pin;
                document.getElementById('newAccountName').value = '';
                document.getElementById('newAccountPin').value = '';
                document.getElementById('newAccountPinConfirm').value = '';
                closeModal('createAccountModal');
                showResultPopup('Akun berhasil dibuat. Silakan masuk.');
            } catch (e) { showResultPopup('Gagal membuat akun. Coba lagi.'); }
        }

        function switchPersonalPanel(panel) {
            if (!['hiasan','informasi','inventory'].includes(panel)) return;
            document.querySelectorAll('.personal-subtab').forEach(button => button.classList.toggle('active', button.dataset.personalPanel === panel));
            document.querySelectorAll('.personal-panel').forEach(element => element.classList.toggle('active', element.id === `personal-panel-${panel}`));
            const actions = document.getElementById('personal-panel-actions');
            if (actions) actions.classList.toggle('active', panel !== 'inventory');
        }

        function updateShopDiamondDisplay() {
            const display = document.getElementById('shop-player-diamond');
            if (!display) return;
            const key = activeLoggedInMemberKey;
            const member = key && globalMembersData[key];
            display.textContent = member ? `💎 Diamond kamu: ${Number(member.diamond || 0).toLocaleString('id-ID')}` : '💎 Diamond kamu: Login untuk melihat saldo.';
        }

        async function loginMember() {
            const enteredName = document.getElementById('selectMemberSelf').value.trim();
            const pin = document.getElementById('inputMemberPin').value.trim();

            if (!enteredName) { alert("Masukkan nama pengguna terlebih dahulu!"); return; }
            if (!pin) { alert("Masukkan Sandi / PIN!"); return; }

            let memberKey = null;
            let m = null;
            try {
                // Ambil data terbaru langsung dari Firebase agar login tidak bergantung
                // pada cache globalMembersData yang mungkin belum selesai tersinkron.
                const freshSnapshot = await membersRef.once('value');
                const freshMembers = freshSnapshot.val() || {};
                globalMembersData = freshMembers;

                const normalizedInput = enteredName.toLocaleLowerCase('id-ID');
                memberKey = Object.keys(freshMembers).find(key => {
                    const member = freshMembers[key] || {};
                    // Periksa kedua field secara terpisah. Akun lama bisa memiliki
                    // nama tampilan berbeda dari username aslinya.
                    const names = [member.nama, member.username, member.userName, member.name]
                        .filter(value => value !== undefined && value !== null)
                        .map(value => String(value).trim().toLocaleLowerCase('id-ID'));
                    return names.includes(normalizedInput);
                });
                if (memberKey) m = freshMembers[memberKey];
            } catch (error) {
                console.error('Gagal mengambil data akun untuk login:', error);
                alert('Tidak bisa memuat data akun. Periksa koneksi Firebase lalu coba lagi.');
                return;
            }

            if (!memberKey || !m) { alert("Akun tidak ditemukan. Silakan periksa kembali nama akun."); return; }

            const storedPin = String(m.pin ?? '1234');
            if (pin === storedPin) {
                const expiredVipUpdates = {};
                clearExpiredVipPlusState(expiredVipUpdates, memberKey, m);
                if (Object.keys(expiredVipUpdates).length) database.ref().update(expiredVipUpdates);
                activeLoggedInMemberKey = memberKey;
                if (typeof renderChats === 'function') renderChats();
                localStorage.setItem('ruangMabarLoggedInMemberKey', memberKey);
                setMemberOnlineStatus(memberKey, true);
                lastKnownMemberStars[memberKey] = Number(m.bintang || 0);
                recordQuestLogin(memberKey);
                startQuestTimeTracking();
                document.getElementById('member-login-box').style.display = 'none';
                document.getElementById('member-edit-box').style.display = 'block';
                document.getElementById('member-personal-profile-preview').style.display = 'block';
                updateMemberPersonalView(m);
                switchPersonalPanel('hiasan');
                updateShopDiamondDisplay();
                refreshMemberPersonalProfilePreview();
                alert(`Selamat datang kembali, ${m.nama || m.username || enteredName}!`);
            } else {
                alert(" Sandi / PIN salah!");
            }
        }

        function logoutMember() {
            if (activeLoggedInMemberKey) setMemberOnlineStatus(activeLoggedInMemberKey, false);
            if (questTimeTicker) { clearInterval(questTimeTicker); questTimeTicker = null; }
            localStorage.removeItem('ruangMabarLoggedInMemberKey');
            activeLoggedInMemberKey = null;
            if (typeof renderChats === 'function') renderChats();
            updateShopDiamondDisplay();
            document.getElementById('member-login-box').style.display = 'block';
            document.getElementById('member-edit-box').style.display = 'none';
            document.getElementById('member-personal-profile-preview').style.display = 'none';
            const personalProfileCard = document.getElementById('member-personal-profile-card');
            if (personalProfileCard) personalProfileCard.innerHTML = '';
            document.getElementById('inputMemberPin').value = '';
            alert("🔒 Berhasil keluar.");
        }

        function saveSelfProfile() {
            if (!activeLoggedInMemberKey) return;

            const newNama = document.getElementById('editSelfNama').value.trim();
            const newBio = document.getElementById('editSelfBio').value.trim();
            const newGame = document.getElementById('editSelfGameKesukaan').value.trim();
            const newGelar = document.getElementById('editSelfGelarSelect').value;
            const newHiasanNama = document.getElementById('editSelfHiasanNamaSelect').value.trim();
            const newKotakNama = (document.getElementById('editSelfKotakNamaSelect') || {}).value || 'default';
            const ownedKotakNama = getItemArray(globalMembersData[activeLoggedInMemberKey]?.unlockedKotakNama);
            if (newKotakNama !== 'default' && (!ownedKotakNama.includes(newKotakNama) || !isItemAvailable(globalMembersData[activeLoggedInMemberKey], newKotakNama))) { showResultPopup('Kamu belum memiliki Kotak Nama tersebut.'); return; }
            const newHiasanProfil = document.getElementById('editSelfHiasanProfilSelect').value.trim();
            const newHiasanDetailProfil = document.getElementById('editSelfHiasanDetailProfilSelect').value.trim();
            const newPin = document.getElementById('editSelfPin').value.trim();
            const badgeSelect = document.getElementById('editSelfBadgeSelect');
            const selectedBadge = badgeSelect ? badgeSelect.value : '';
            const gallerySelect = document.getElementById('editSelfGalleryItems');
            const selectedGalleryItems = gallerySelect ? Array.from(gallerySelect.selectedOptions).slice(0, 10).map(option => option.value) : [];

            const currentMember = globalMembersData[activeLoggedInMemberKey];
            if (newHiasanDetailProfil === 'vip_plus_gold' && !hasActiveVipPlus(currentMember)) {
                alert(' Hiasan Detail Profil VIP Plus hanya dapat digunakan oleh member VIP Plus!');
                return;
            }

            if (!newNama) { alert("Nama tidak boleh kosong!"); return; }
            if (newNama.length > 15) { alert('Nama maksimal 15 karakter.'); return; }
            if (newBio.length > 150) { alert('Bio maksimal 150 karakter.'); return; }
            if (newGame.length > 25) { alert('Game kesukaan maksimal 25 karakter.'); return; }
            if ((newHiasanNama !== 'default' && !isItemAvailable(currentMember, newHiasanNama)) ||
                (newHiasanProfil !== 'default' && !isItemAvailable(currentMember, newHiasanProfil)) ||
                (newGelar !== '-' && !isItemAvailable(currentMember, newGelar)) ||
                (newHiasanDetailProfil !== 'default' && (!isItemAvailable(currentMember, newHiasanDetailProfil) || !getItemArray(currentMember.unlockedHiasanDetailProfil).includes(newHiasanDetailProfil)))) {
                alert('Masa aktif item sudah habis. Pilih item lain yang masih aktif atau permanen.');
                updateMemberPersonalView(currentMember);
                return;
            }
            if (!hasActiveVipPlus(currentMember)) {
                if (newHiasanNama === 'vip_plus_gold' || newHiasanProfil === 'vip_plus_gold' || newHiasanDetailProfil === 'vip_plus_gold' || newGelar === 'VIP Plus Member') {
                    alert(' VIP Plus kamu sudah tidak aktif.');
                    return;
                }
            }

            const updates = {};
            updates[`members/${activeLoggedInMemberKey}/lencanaDitampilkan`] = selectedBadge;
            updates[`members/${activeLoggedInMemberKey}/galleryItems`] = selectedGalleryItems;
            updates[`members/${activeLoggedInMemberKey}/nama`] = newNama;
            updates[`members/${activeLoggedInMemberKey}/bio`] = newBio;
            updates[`members/${activeLoggedInMemberKey}/gameKesukaan`] = newGame;
            updates[`members/${activeLoggedInMemberKey}/gelar`] = newGelar;
            updates[`members/${activeLoggedInMemberKey}/hiasanNama`] = newHiasanNama;
            updates[`members/${activeLoggedInMemberKey}/kotakNama`] = newKotakNama;
            updates[`members/${activeLoggedInMemberKey}/hiasanProfil`] = newHiasanProfil;
            updates[`members/${activeLoggedInMemberKey}/hiasanDetailProfil`] = newHiasanDetailProfil;

            if (newPin) {
                updates[`members/${activeLoggedInMemberKey}/pin`] = newPin;
                document.getElementById('editSelfPin').value = '';
            }

            alert("✅ Profil kamu berhasil disimpan!");
            database.ref().update(updates);
        }
