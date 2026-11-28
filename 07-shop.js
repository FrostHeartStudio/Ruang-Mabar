// Ruang Mabar module: 07-shop.js
// Keep this file loaded in the order declared in index.html.
        // Judul item satu baris: dapat digeser dengan swipe atau drag.
        function enableShopTitleScrolling(root) {
            if (!root) return;
            root.querySelectorAll('.shop-title-viewport').forEach(viewport => {
                if (viewport.dataset.dragReady === '1') return;
                viewport.dataset.dragReady = '1';
                let dragging = false;
                let startX = 0;
                let startScroll = 0;
                viewport.addEventListener('pointerdown', event => {
                    if (event.pointerType !== 'mouse' || viewport.scrollWidth <= viewport.clientWidth) return;
                    dragging = true;
                    startX = event.clientX;
                    startScroll = viewport.scrollLeft;
                    viewport.classList.add('is-dragging');
                });
                viewport.addEventListener('pointermove', event => {
                    if (!dragging) return;
                    viewport.scrollLeft = startScroll - (event.clientX - startX);
                });
                const stopDrag = () => {
                    dragging = false;
                    viewport.classList.remove('is-dragging');
                };
                viewport.addEventListener('pointerup', stopDrag);
                viewport.addEventListener('pointercancel', stopDrag);
                viewport.addEventListener('pointerleave', stopDrag);
            });
        }

// Konfirmasi pembelian bersama untuk Shop Resmi dan Marketplace.
        let pendingPurchaseAction = null;
        function openPurchaseConfirmation(details, onConfirm) {
            const dialog = document.getElementById('purchaseConfirmDialog');
            if (!dialog) return;
            document.getElementById('purchaseConfirmName').textContent = details.name || 'Item';
            document.getElementById('purchaseConfirmType').textContent = details.type || 'Item';
            document.getElementById('purchaseConfirmDescription').textContent = details.description || 'Item akan ditambahkan ke Inventory setelah pembelian berhasil.';
            document.getElementById('purchaseConfirmPrice').textContent = `💎 ${Number(details.price || 0).toLocaleString('id-ID')} Diamond`;
            pendingPurchaseAction = onConfirm;
            if (!dialog.dataset.confirmHandlerReady) {
                dialog.addEventListener('close', () => {
                    const action = pendingPurchaseAction;
                    pendingPurchaseAction = null;
                    if (dialog.returnValue === 'confirm' && typeof action === 'function') action();
                });
                dialog.dataset.confirmHandlerReady = '1';
            }
            if (!dialog.open) dialog.showModal();
        }

        function getShopPurchaseDescription(item) {
            const duration = item.masaBerlakuTipe === 'custom'
                ? `Masa berlaku ${Math.max(0, Number(item.masaBerlakuHari || 0))} hari.`
                : 'Masa berlaku permanen.';
            const benefit = item.tipe === 'VIP'
                ? 'Termasuk gelar VIP Member, boost 2x, dan hiasan nama VIP.'
                : item.tipe === 'VIP Plus'
                    ? 'Termasuk gelar VIP Plus Member, boost 3x, serta hiasan VIP Plus.'
                    : item.tipe === 'Tiket'
                        ? `Berisi ${Math.max(1, Number(item.ticketCount || 1))} tiket.`
                        : (item.deskripsi || item.keterangan || item.description || `Item ${item.tipe || 'khusus'} untuk koleksi dan personalisasi profil.`);
            return `${benefit} ${duration}`;
        }

                // Kategori Shop Resmi; setiap tipe tetap memakai data dan alur pembelian lama.
        let activeShopCategory = 'hiasan-nama';
        const shopCategoryMeta = {
            'hiasan-nama': { label: 'Hiasan Nama', icon: '✨', description: 'Percantik nama profil dengan berbagai efek dan warna.', types: ['Hiasan Nama'] },
            'kotak-nama': { label: 'Kotak Nama', icon: '▣', description: 'Pilih latar khusus untuk kotak nama profilmu.', types: ['Kotak Nama'] },
            'hiasan-profil': { label: 'Hiasan Profil', icon: '🖼️', description: 'Tambahkan bingkai dan nuansa visual pada profilmu.', types: ['Hiasan Profil'] },
            'hiasan-detail': { label: 'Hiasan Detail Profil', icon: '💠', description: 'Hiasi bagian detail profil dengan tampilan unik.', types: ['Hiasan Detail Profil'] },
            'gamepass': { label: 'Gamepass', icon: '👑', description: 'Akses benefit VIP dan peningkatan khusus.', types: ['VIP', 'VIP Plus'] },
            'item': { label: 'Item', icon: '🎟️', description: 'Item tambahan, tiket, gelar, dan perlengkapan lainnya.', types: ['Tiket', 'Gelar', 'Lencana'] }
        };

        function selectShopCategory(category) {
            const meta = shopCategoryMeta[category];
            if (!meta) return;
            activeShopCategory = category;
            const categoryView = document.getElementById('shop-official-category-view');
            const itemsView = document.getElementById('shop-official-items-view');
            const title = document.getElementById('shop-category-title');
            const description = document.getElementById('shop-category-description');
            if (categoryView) categoryView.style.display = 'none';
            if (itemsView) itemsView.style.display = 'block';
            if (title) title.textContent = `${meta.icon} ${meta.label}`;
            if (description) description.textContent = meta.description;
            const search = document.getElementById('shop-search');
            if (search) search.value = '';
            renderShop();
        }

        function showShopOfficialCategories() {
            const categoryView = document.getElementById('shop-official-category-view');
            const itemsView = document.getElementById('shop-official-items-view');
            if (categoryView) categoryView.style.display = 'block';
            if (itemsView) itemsView.style.display = 'none';
        }

        function renderShopEmptyState(category, isSearch = false) {
            const meta = shopCategoryMeta[category] || shopCategoryMeta.item;
            return `<article class="shop-empty-card"><span class="shop-empty-icon">${isSearch ? '🔎' : '📦'}</span><strong>${isSearch ? 'Item tidak ditemukan' : `Belum ada ${escapeHTML(meta.label)}`}</strong><p>${isSearch ? 'Coba kata kunci lain atau pilih kategori berbeda.' : 'Belum ada item yang tersedia di kategori ini. Cek lagi nanti, ya!'}</p><span class="shop-empty-status">${isSearch ? 'PENCARIAN KOSONG' : 'BELUM TERSEDIA'}</span></article>`;
        }

        // RENDER SHOP
        function renderShop() {
            const shopList = document.getElementById('shop-list');
            if (!shopList) return;
            shopList.innerHTML = '';
            const searchText = (document.getElementById('shop-search')?.value || '').trim().toLocaleLowerCase('id-ID');

            Object.keys(globalShopData).sort((a, b) => {
                const aTime = Number(globalShopData[a].createdAt || 0);
                const bTime = Number(globalShopData[b].createdAt || 0);
                return bTime - aTime;
            }).forEach(key => {
                const item = globalShopData[key];
                const categoryTypes = shopCategoryMeta[activeShopCategory].types;
                if (!categoryTypes.includes(item.tipe || '')) return;
                const searchable = `${item.nama || ''} ${item.tipe || ''} ${item.preset || ''} ${item.gelarValue || ''}`.toLocaleLowerCase('id-ID');
                if (searchText && !searchable.includes(searchText)) return;
                const masaBerlakuText = item.masaBerlakuTipe === 'custom' ? `⏳ ${item.masaBerlakuHari || 0} Hari` : '♾️ Permanen';
                const benefitText = item.tipe === 'VIP' ? ' • Gelar VIP Member • Boost 2x • Hiasan Nama VIP (Gold Shiny)' : (item.tipe === 'VIP Plus' ? ' • Gelar VIP Plus Member • Boost 3x • Hiasan Nama & Profil VIP Plus Gold Shiny' : '');

                const card = document.createElement('div');
                card.className = 'shop-item-card';
                const isNewShopItem = Number(item.createdAt || 0) > 0 && (Date.now() - Number(item.createdAt)) < (2 * 24 * 60 * 60 * 1000);
                card.innerHTML = `
                    <div class="shop-card-main">
                        <div class="shop-card-copy">
                            <div class="shop-title-row">
                                <div class="shop-title-viewport" tabindex="0" role="region" aria-label="Judul item, geser horizontal untuk membaca lengkap" title="Geser untuk membaca judul lengkap"><span class="shop-title-text shop-title">${escapeHTML(item.nama)}</span></div>
                                ${isNewShopItem ? '<span class="shop-new-badge">BARU</span>' : ''}
                            </div>
                            <div class="shop-type-tag">${escapeHTML(item.tipe === 'Tiket' ? ((item.preset === 'super_ticket' ? 'Super Tiket' : 'Play Tiket') + ' ×' + Math.max(1, Number(item.ticketCount || 1))) : item.tipe)}${escapeHTML(benefitText)}</div>
                            <div class="shop-expiry">Masa berlaku <strong>${escapeHTML(masaBerlakuText)}</strong></div>
                        </div>
                    </div>
                    <div class="shop-card-divider" aria-hidden="true"></div>
                    <div class="shop-card-footer">
                        <div class="shop-price">💎 ${Number(item.harga || 0).toLocaleString('id-ID')} <span>/ item</span></div>
                        <div class="shop-stock">Stok ${Math.max(0, Number(item.stok || 0))}</div>
                        <button type="button" class="btn-buy" onclick="buyShopItem('${key}')">Beli</button>
                    </div>
                `;
                shopList.appendChild(card);
            });
            enableShopTitleScrolling(shopList);
            if (!shopList.children.length) shopList.innerHTML = renderShopEmptyState(activeShopCategory, !!searchText);
        }

        function buyShopItem(shopKey) {
            playUiSound('buy');
            if (!activeLoggedInMemberKey) {
                alert("Silakan login terlebih dahulu di tab Personalisasi sebelum membeli item!");
                switchTab('personal');
                return;
            }
            const item = globalShopData[shopKey];
            if (!item) return;
            const member = globalMembersData[activeLoggedInMemberKey];
            if (!member) return;
            const tipePembelian = item.tipePembelian || 'bebas';
            if (tipePembelian === '1x' && member.shopPurchases && member.shopPurchases[shopKey]) {
                alert(" Item ini hanya dapat dibeli 1x!");
                return;
            }
            const price = Number(item.harga || 0);
            if (Number(item.stok || 0) <= 0) {
                alert(" Stok item ini sudah habis!");
                return;
            }
            if (Number(member.diamond || 0) < price) {
                alert(" Diamond kamu tidak cukup untuk membeli item ini!");
                return;
            }
            openPurchaseConfirmation({
                name: item.nama || 'Item Shop',
                type: item.tipe || 'Item',
                description: getShopPurchaseDescription(item),
                price
            }, () => processShopItemPurchase(shopKey));
        }

        function processShopItemPurchase(shopKey) {
            const item = globalShopData[shopKey];
            const memberKey = activeLoggedInMemberKey;
            const member = memberKey && globalMembersData[memberKey];
            if (!item || !member) return;
            const tipePembelian = item.tipePembelian || 'bebas';
            if (tipePembelian === '1x' && member.shopPurchases && member.shopPurchases[shopKey]) {
                alert(" Item ini hanya dapat dibeli 1x!");
                return;
            }
            const currentDiamond = Number(member.diamond || 0);
            const price = Number(item.harga || 0);
            const stock = Number(item.stok || 0);
            if (stock <= 0) { alert(" Stok item ini sudah habis!"); return; }
            if (currentDiamond < price) { alert(" Diamond kamu tidak cukup untuk membeli item ini!"); return; }

            const updates = {};
            updates[`members/${memberKey}/diamond`] = currentDiamond - price;
            updates[`shop/${shopKey}/stok`] = stock - 1;
            if (tipePembelian === '1x') updates[`members/${memberKey}/shopPurchases/${shopKey}`] = true;
            const addedDays = (item.masaBerlakuTipe === 'custom') ? Number(item.masaBerlakuHari || 0) : 0;

            if (item.tipe === 'Hiasan Nama') {
                let unlockedH = getItemArray(member.unlockedHiasan);
                unlockedH.push(item.preset);
                updates[`members/${memberKey}/unlockedHiasan`] = unlockedH;
                updates[`members/${memberKey}/hiasanNama`] = item.preset;
                if (addedDays > 0) stackItemDuration(updates, memberKey, member, item.preset, addedDays);
                else updates[`members/${memberKey}/itemExpiries/${item.preset}`] = null;
            } else if (item.tipe === 'Hiasan Profil') {
                let unlockedP = getItemArray(member.unlockedHiasanProfil);
                unlockedP.push(item.preset);
                updates[`members/${memberKey}/unlockedHiasanProfil`] = unlockedP;
                updates[`members/${memberKey}/hiasanProfil`] = item.preset;
                if (addedDays > 0) stackItemDuration(updates, memberKey, member, item.preset, addedDays);
                else updates[`members/${memberKey}/itemExpiries/${item.preset}`] = null;
            } else if (item.tipe === 'Hiasan Detail Profil') {
                let unlockedD = getItemArray(member.unlockedHiasanDetailProfil);
                unlockedD.push(item.preset);
                updates[`members/${memberKey}/unlockedHiasanDetailProfil`] = unlockedD;
                updates[`members/${memberKey}/hiasanDetailProfil`] = item.preset;
                if (addedDays > 0) stackItemDuration(updates, memberKey, member, item.preset, addedDays);
                else updates[`members/${memberKey}/itemExpiries/${item.preset}`] = null;
            } else if (item.tipe === 'Kotak Nama') {
                const unlockedBoxes = getItemArray(member.unlockedKotakNama);
                unlockedBoxes.push(item.preset);
                updates[`members/${memberKey}/unlockedKotakNama`] = unlockedBoxes;
                updates[`members/${memberKey}/kotakNama`] = item.preset;
                if (addedDays > 0) stackItemDuration(updates, memberKey, member, item.preset, addedDays);
                else updates[`members/${memberKey}/itemExpiries/${item.preset}`] = null;
            } else if (item.tipe === 'Gelar') {
                let unlockedT = getItemArray(member.unlockedTitles);
                unlockedT.push(item.gelarValue);
                updates[`members/${memberKey}/unlockedTitles`] = unlockedT;
                updates[`members/${memberKey}/gelar`] = item.gelarValue;
                if (addedDays > 0) stackItemDuration(updates, memberKey, member, item.gelarValue, addedDays);
                else updates[`members/${memberKey}/itemExpiries/${item.gelarValue}`] = null;
            } else if (item.tipe === 'Tiket') {
                const ticketCount = Math.max(1, Number(item.ticketCount || 1));
                if (item.preset === 'super_ticket') updates[`members/${memberKey}/superTickets`] = Number(member.superTickets || 0) + ticketCount;
                else updates[`members/${memberKey}/playTickets`] = Number(member.playTickets || 0) + ticketCount;
            } else if (item.tipe === 'VIP Plus') {
                updates[`members/${memberKey}/isVip`] = true;
                updates[`members/${memberKey}/isVipPlus`] = true;
                updates[`members/${memberKey}/boost`] = Math.max(Number(member.boost || 1), 3);
                let unlockedH = getItemArray(member.unlockedHiasan);
                unlockedH.push('vip_plus_gold');
                updates[`members/${memberKey}/unlockedHiasan`] = unlockedH;
                updates[`members/${memberKey}/hiasanNama`] = 'vip_plus_gold';
                let unlockedP = getItemArray(member.unlockedHiasanProfil);
                unlockedP.push('vip_plus_gold');
                updates[`members/${memberKey}/unlockedHiasanProfil`] = unlockedP;
                updates[`members/${memberKey}/hiasanProfil`] = 'vip_plus_gold';
                updates[`members/${memberKey}/hiasanDetailProfil`] = 'vip_plus_gold';
                let unlockedT = getItemArray(member.unlockedTitles);
                unlockedT.push('VIP Plus Member');
                updates[`members/${memberKey}/unlockedTitles`] = unlockedT;
                updates[`members/${memberKey}/gelar`] = 'VIP Plus Member';
                if (addedDays > 0) stackItemDuration(updates, memberKey, member, 'vip_plus_gold', addedDays);
                else updates[`members/${memberKey}/itemExpiries/vip_plus_gold`] = null;
            } else if (item.tipe === 'VIP') {
                updates[`members/${memberKey}/isVip`] = true;
                const boostVal = member.isVipPlus ? Math.max(Number(member.boost || 1), 3) : Math.max(Number(member.boost || 1), 2);
                updates[`members/${memberKey}/boost`] = boostVal;
                let unlockedH = getItemArray(member.unlockedHiasan);
                unlockedH.push('vip_gold');
                updates[`members/${memberKey}/unlockedHiasan`] = unlockedH;
                updates[`members/${memberKey}/hiasanNama`] = 'vip_gold';
                let unlockedT = getItemArray(member.unlockedTitles);
                unlockedT.push('VIP Member');
                updates[`members/${memberKey}/unlockedTitles`] = unlockedT;
                updates[`members/${memberKey}/gelar`] = 'VIP Member';
                if (addedDays > 0) stackItemDuration(updates, memberKey, member, 'vip_gold', addedDays);
                else updates[`members/${memberKey}/itemExpiries/vip_gold`] = null;
            }

            database.ref().update(updates).then(() => {
                member.diamond = currentDiamond - price;
                if (item.tipe === 'Tiket') {
                    const count = Math.max(1, Number(item.ticketCount || 1));
                    if (item.preset === 'super_ticket') {
                        member.superTickets = Number(member.superTickets || 0) + count;
                        if (typeof updateSuperTicketLabel === 'function') updateSuperTicketLabel();
                    } else {
                        member.playTickets = Number(member.playTickets || 0) + count;
                        if (typeof updateMemberPersonalView === 'function') updateMemberPersonalView(member);
                    }
                }
                recordQuestShopPurchase();
                updateShopDiamondDisplay();
                refreshMarketplaceDiamond();
                renderShop();
                showResultPopup(`Berhasil membeli ${item.nama || 'item'}!`);
            }).catch(err => {
                console.error('Pembelian Shop gagal:', err);
                showResultPopup('Pembelian gagal disimpan. Diamond dan item tidak berubah. Coba lagi.');
            });
        }
