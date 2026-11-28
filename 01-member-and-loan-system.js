// Ruang Mabar module: 01-member-and-loan-system.js
// Keep this file loaded in the order declared in index.html.
        // ABSEN ADMIN
        function triggerAbsen() {
            const selectedKey = document.getElementById('adminAbsenMemberSelect')?.value;
            if (!selectedKey) {
                alert("Pilih nama member terlebih dahulu!");
                return;
            }

            const member = globalMembersData[selectedKey];
            if (!member) return;

            const today = new Date().toDateString();
            if (member.lastAbsen === today) {
                alert("⚠️ Member tersebut sudah melakukan absen hari ini!");
                return;
            }

            const boost = Math.max(0, Number(member.boost || 1));
            const bonusDiamond = 100 * boost;
            const bonusBintang = 1 * boost;
            const bonusLevel = 1;

            const updates = {};
            updates[`members/${selectedKey}/lastAbsen`] = today;
            updates[`members/${selectedKey}/diamond`] = Number(member.diamond || 0) + bonusDiamond;
            updates[`members/${selectedKey}/bintang`] = Number(member.bintang || 0) + bonusBintang;
            updates[`members/${selectedKey}/level`] = Number(member.level || 1) + bonusLevel;

            alert(`🎉 Absen Berhasil!\n\nMember: ${member.nama || 'Member'}\nHadiah: +${bonusDiamond} 💎 Diamond\n+${bonusBintang} ⭐ Bintang\n+${bonusLevel} Level\nBoost: ${boost}x`);
            database.ref().update(updates).catch(err => {
                alert("Absen gagal disimpan: " + (err.message || "Terjadi kesalahan."));
            });
        }

        function showLoanView(view) {
            const categories = document.getElementById('loanCategoryView');
            const player = document.getElementById('loanPlayerView');
            const bank = document.getElementById('loanBankView');
            const playerTitle = document.getElementById('loansModalTitle');
            const bankTitle = document.getElementById('loansBankTitle');
            if (!categories || !player || !bank) return;
            categories.style.display = view === 'categories' ? '' : 'none';
            player.style.display = view === 'player' ? '' : 'none';
            bank.style.display = view === 'bank' ? '' : 'none';
            if (playerTitle) playerTitle.textContent = '🤝 Penawaran Antar-Player';
            if (bankTitle) bankTitle.textContent = '🏦 Pinjaman Bank Resmi';
            if (view === 'player' || view === 'bank') refreshLoanOffers();
        }

        // SISTEM PINJAMAN: penawaran, kontrak, cicilan, refund, dan jatuh tempo.
        function escapeLoanText(value) {
            return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        }

        async function refreshLoanOffers() {
            try {
                const [bankSnap, playerSnap, contractsSnap, bankContractsSnap] = await Promise.all([bankLoanOffersRef.once('value'), playerLoanOffersRef.once('value'), playerLoanContractsRef.once('value'), bankLoanContractsRef.once('value')]);
                globalBankLoanOffers = bankSnap.val() || {};
                globalPlayerLoanOffers = playerSnap.val() || {};
                globalPlayerLoanContracts = contractsSnap.val() || {};
                globalBankLoanContracts = bankContractsSnap.val() || {};
                await processLoanDefaults();
                // Ambil ulang kontrak setelah proses jatuh tempo agar status terbaru langsung tampil.
                const [freshPlayerContracts, freshBankContracts] = await Promise.all([playerLoanContractsRef.once('value'), bankLoanContractsRef.once('value')]);
                globalPlayerLoanContracts = freshPlayerContracts.val() || {};
                globalBankLoanContracts = freshBankContracts.val() || {};
                const now = Date.now();
                const removals = [];
                for (const [contractId, contract] of Object.entries(globalPlayerLoanContracts)) {
                    const finishedAt = Number(contract.paidAt || contract.defaultedAt || 0);
                    if (['Lunas','Tidak mampu membayar'].includes(contract.status) && finishedAt && now - finishedAt >= 86400000) {
                        removals.push(playerLoanContractsRef.child(contractId).remove());
                        delete globalPlayerLoanContracts[contractId];
                    }
                }
                for (const [contractId, contract] of Object.entries(globalBankLoanContracts)) {
                    const finishedAt = Number(contract.paidAt || contract.defaultedAt || 0);
                    if (['Lunas','Tidak mampu membayar'].includes(contract.status) && finishedAt && now - finishedAt >= 86400000) {
                        removals.push(bankLoanContractsRef.child(contractId).remove());
                        delete globalBankLoanContracts[contractId];
                    }
                }
                if (removals.length) await Promise.all(removals);
                renderLoanOfferLists();
            } catch (err) {
                console.error('Gagal memuat data pinjaman:', err);
                ['officialLoanOffersList','playerLoanOffersList','adminBankLoanOffersList'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent='Daftar gagal dimuat. Periksa koneksi atau akses Firebase, lalu coba buka kembali.'; });
            }
        }

        function renderLoanOfferLists() {
            const official = document.getElementById('officialLoanOffersList');
            const player = document.getElementById('playerLoanOffersList');
            const admin = document.getElementById('adminBankLoanOffersList');
            const banks = Object.entries(globalBankLoanOffers);
            const players = Object.entries(globalPlayerLoanOffers);
            const allContracts = [...Object.values(globalPlayerLoanContracts), ...Object.values(globalBankLoanContracts)];
            const hasActive = key => !!key && allContracts.some(c => (c.borrowerKey === key || c.lenderKey === key) && ['Aktif','Memproses jatuh tempo','Tidak mampu membayar'].includes(c.status));
            if (official) {
                const cards = banks.map(([id,o]) => {
                    const contractEntry = Object.entries(globalBankLoanContracts).filter(([,c]) => c.offerId === id).sort((a,b) => (b[1].status === 'Aktif') - (a[1].status === 'Aktif') || Number(b[1].startedAt||0) - Number(a[1].startedAt||0))[0];
                    const contract = contractEntry?.[1];
                    if (contract) return renderLoanContractCard(contractEntry[0], contract, 'bank', o);
                    const total = Math.ceil(Number(o.amount||0)*(1+Number(o.interest||0)/100));
                    const canBorrow = activeLoggedInMemberKey && !hasActive(activeLoggedInMemberKey);
                    return `<div class="loan-offer-card"><strong>${escapeLoanText(o.name||'Pinjaman Bank')}</strong><div class="loan-meta">Nominal: 💎 ${Number(o.amount||0).toLocaleString('id-ID')}</div><div class="loan-meta">Bunga: ${Number(o.interest||0)}%</div><div class="loan-meta">Peminjam: -</div><div class="loan-meta">Total yang harus dibayar: 💎 ${total.toLocaleString('id-ID')}</div>${canBorrow ? `<button class="btn-action" onclick="borrowBankLoan('${id}')">🏦 Ajukan / Pinjam</button>` : ''}</div>`;
                }).join('');
                const orphanContracts = Object.entries(globalBankLoanContracts).filter(([,c]) => !globalBankLoanOffers[c.offerId]).map(([id,c])=>renderLoanContractCard(id,c,'bank')).join('');
                official.innerHTML = cards + orphanContracts || '<p>Belum ada pilihan pinjaman resmi dari bank.</p>';
            }
            if (player) {
                const cards = players.map(([id,o]) => {
                    const contractEntry = Object.entries(globalPlayerLoanContracts).filter(([,c]) => c.offerId === id).sort((a,b) => (b[1].status === 'Aktif') - (a[1].status === 'Aktif') || Number(b[1].startedAt||0) - Number(a[1].startedAt||0))[0];
                    const contract = contractEntry?.[1];
                    if (contract) return renderLoanContractCard(contractEntry[0], contract, 'player', o);
                    const isOwner = activeLoggedInMemberKey === o.memberKey;
                    const total = Math.ceil(Number(o.amount||0)*(1+Number(o.interest||0)/100));
                    const refund = isOwner ? `<button class="loan-refund-x" title="Refund penawaran" aria-label="Refund penawaran" onclick="refundPlayerLoanOffer('${id}')">×</button>` : '';
                    return `<div class="loan-offer-card">${refund}<strong>💎 ${Number(o.amount||0).toLocaleString('id-ID')} Diamond</strong><div class="loan-meta">Status pinjaman: <b>Menunggu</b></div><div class="loan-meta">Bunga: ${Number(o.interest||0)}%</div><div class="loan-meta">Tenggang waktu: ${Number(o.days||5)} hari</div><div class="loan-meta">Total yang harus dibayar: 💎 ${total.toLocaleString('id-ID')}</div><div class="loan-meta">Pemberi: ${escapeLoanText(o.memberName||'Player')}</div><div class="loan-meta">Peminjam: -</div>${isOwner || hasActive(activeLoggedInMemberKey) ? '' : `<button class="btn-action" onclick="borrowPlayerLoan('${id}')">🤝 Ajukan Pinjaman</button>`}</div>`;
                }).join('');
                const orphanContracts = Object.entries(globalPlayerLoanContracts).filter(([,c]) => !globalPlayerLoanOffers[c.offerId]).map(([id,c])=>renderLoanContractCard(id,c,'player')).join('');
                player.innerHTML = cards + orphanContracts || '<p>Belum ada penawaran atau kontrak pinjaman player.</p>';
            }
            if (admin) admin.innerHTML = banks.length ? banks.map(([id,o]) => `<div class="loan-offer-card"><strong>${escapeLoanText(o.name||'Pinjaman Resmi')}</strong><div class="loan-meta">Nominal: 💎 ${Number(o.amount||0).toLocaleString('id-ID')} · Bunga: ${Number(o.interest||0)}%</div><button onclick="adminDeleteBankLoanOffer('${id}')">Hapus pilihan</button></div>`).join('') : '<p>Belum ada pilihan pinjaman resmi.</p>';

        }
        function renderLoanContractCard(id,c,type,offer=null) {
            const borrower = activeLoggedInMemberKey === c.borrowerKey;
            const isOwner = type === 'player' && activeLoggedInMemberKey === (offer?.memberKey || c.lenderKey);
            const total = Number(c.totalDue||0), paid = Number(c.paidAmount||0), remain = Math.max(0,total-paid);
            const status = c.status === 'Aktif' && !borrower ? 'Pinjaman aktif' : (c.status === 'Tidak mampu membayar' ? 'Belum Lunas' : (c.status||'Menunggu'));
            const title = `💎 ${Number(c.amount||0).toLocaleString('id-ID')} Diamond`;
            const payButton = borrower && c.status === 'Aktif' ? `<button class="btn-action" onclick="${type==='bank'?'payBankLoanInstallment':'payPlayerLoanInstallment'}('${id}')">💎 Bayar Cicilan</button>` : '';
            const refundButton = ''; // Refund hanya tersedia pada penawaran yang belum dipinjam.
            const dueLabel = type === 'player' && c.dueAt ? `<div class="loan-meta">Jatuh tempo: ${new Date(Number(c.dueAt)).toLocaleDateString('id-ID')}</div>` : '';
            const lenderName = type === 'bank' ? 'Bank Resmi' : (c.lenderName||'Player');
            const history = Object.values(c.paymentHistory || {}).sort((a,b) => Number(b.at||0) - Number(a.at||0));
            const activity = history.length ? `<div class="loan-activity"><b>Aktivitas pembayaran</b>${history.map(item => `<div class="loan-meta">${new Date(Number(item.at||0)).toLocaleString('id-ID')} · ${escapeLoanText(item.memberName||c.borrowerName||'Peminjam')} membayar 💎 ${Number(item.amount||0).toLocaleString('id-ID')}</div>`).join('')}</div>` : '<div class="loan-meta">Aktivitas pembayaran: Belum ada setoran.</div>';
            const defaultActivity = c.status === 'Tidak mampu membayar' ? `<div class="loan-meta loan-default-note">Pinjaman melewati jatuh tempo dan dinyatakan belum lunas.</div>` : '';
            return `<div class="loan-offer-card">${refundButton}<strong>${title}</strong><div class="loan-meta">Status pinjaman: <b>${escapeLoanText(status)}</b></div><div class="loan-meta">Bunga: ${Number(c.interest||0)}%</div>${type === 'player' ? `<div class="loan-meta">Tenggang waktu: ${Number(c.days||5)} hari</div>` : ''}${dueLabel}<div class="loan-meta">Total yang harus dibayar: 💎 ${total.toLocaleString('id-ID')}</div><div class="loan-meta">Sudah dibayar: 💎 ${paid.toLocaleString('id-ID')}</div><div class="loan-meta">Sisa utang: 💎 ${remain.toLocaleString('id-ID')}</div><div class="loan-meta">Pemberi: ${escapeLoanText(lenderName)}</div><div class="loan-meta">Peminjam: ${escapeLoanText(c.borrowerName||'-')}</div>${activity}${defaultActivity}${payButton}</div>`;
        }
        function openPlayerLoanFaq() {
            const dialog = document.getElementById('playerLoanFaqDialog');
            if (dialog && !dialog.open) dialog.showModal();
        }

        function openPlayerLoanEditor() {
            const key = activeLoggedInMemberKey;
            if (!key) return showResultPopup('Login dulu untuk mengatur penawaran pinjaman player.');
            // Form selalu kosong untuk penawaran baru; penawaran lama tetap tersimpan.
            const amountInput = document.getElementById('playerLoanAmount');
            const interestInput = document.getElementById('playerLoanInterest');
            const daysInput = document.getElementById('playerLoanDays');
            if (amountInput) amountInput.value = '';
            if (interestInput) interestInput.value = '';
            if (daysInput) daysInput.value = '5';
            openModal('playerLoanEditorModal');
        }
        function editPlayerLoanOffer(id) {
            const o = globalPlayerLoanOffers[id];
            if (!o || o.memberKey !== activeLoggedInMemberKey) return showResultPopup('Penawaran ini bukan milik akun kamu.');
            document.getElementById('playerLoanAmount').value = Number(o.amount || '');
            document.getElementById('playerLoanInterest').value = Number(o.interest || 0);
            document.getElementById('playerLoanDays').value = Number(o.days || 5);
            openModal('playerLoanEditorModal');
        }
        async function refundPlayerLoanOffer(id) { const o=globalPlayerLoanOffers[id]; if(!o || o.memberKey!==activeLoggedInMemberKey) return showResultPopup('Penawaran ini bukan milik akun kamu.'); const active=Object.values(globalPlayerLoanContracts).some(c=>c.offerId===id && c.status==='Aktif'); if(active) return showResultPopup('Refund tidak tersedia selama pinjaman aktif.'); if(!confirm('Refund penawaran ini? Diamond yang ditahan akan dikembalikan 100%.')) return; try { if(Number(o.escrowAmount||0)>0) { const ref=database.ref(`members/${o.memberKey}/diamond`); await ref.transaction(v=>Number(v||0)+Number(o.escrowAmount||0)); } await playerLoanOffersRef.child(id).remove(); await refreshLoanOffers(); showResultPopup('Refund 100% berhasil.'); } catch(e) { showResultPopup('Refund gagal diproses.'); } }
        async function processLoanDefaults() {
            const now = Date.now();
            for (const [id, contract] of Object.entries(globalPlayerLoanContracts)) {
                if (contract.status !== 'Aktif' || !contract.dueAt || now < Number(contract.dueAt)) continue;
                const contractRef = playerLoanContractsRef.child(id);
                const claim = await contractRef.child('status').transaction(current => current === 'Aktif' ? 'Memproses jatuh tempo' : undefined);
                if (!claim.committed) continue;
                try {
                    const [lenderSnap, borrowerSnap] = await Promise.all([
                        database.ref(`members/${contract.lenderKey}`).once('value'),
                        database.ref(`members/${contract.borrowerKey}`).once('value')
                    ]);
                    const lender = lenderSnap.val();
                    const borrower = borrowerSnap.val();
                    if (!lender || !borrower) throw new Error('Akun pemberi atau peminjam tidak ditemukan.');
                    const remain = Math.max(0, Number(contract.totalDue || 0) - Number(contract.paidAmount || 0));
                    await database.ref().update({
                        [`members/${contract.lenderKey}/diamond`]: Number(lender.diamond || 0) + remain,
                        [`members/${contract.borrowerKey}/diamond`]: Number(borrower.diamond || 0) - remain,
                        [`loanPlayerContracts/${id}/status`]: 'Tidak mampu membayar',
                        [`loanPlayerContracts/${id}/defaultedAt`]: now,
                        [`loanPlayerContracts/${id}/defaultedAmount`]: remain
                    });
                } catch (error) {
                    await contractRef.child('status').transaction(current => current === 'Memproses jatuh tempo' ? 'Aktif' : current);
                    throw error;
                }
            }
        }
        async function savePlayerLoanOffer() {
            const key = activeLoggedInMemberKey;
            if (!key) return showResultPopup('Login dulu untuk mengatur penawaran pinjaman player.');
            const amountInput = document.getElementById('playerLoanAmount');
            const interestInput = document.getElementById('playerLoanInterest');
            const daysInput = document.getElementById('playerLoanDays');
            const amount = Number(amountInput?.value);
            const interest = Number(interestInput?.value || 0);
            const days = Number(daysInput?.value || 5);
            if (!Number.isSafeInteger(amount) || amount < 1 || !Number.isFinite(interest) || interest < 0 || interest > 1000 || !Number.isInteger(days) || days < 5 || days > 30) return showResultPopup('Nominal harus lebih dari 0, bunga harus 0–1000%, dan tenggang waktu harus 5–30 hari.');
            let escrowDeducted = false;
            try {
                const activeAsBorrower = [...Object.values(globalPlayerLoanContracts), ...Object.values(globalBankLoanContracts)].some(c => c.borrowerKey === key && ['Aktif','Memproses jatuh tempo','Tidak mampu membayar'].includes(c.status));
                if (activeAsBorrower) return showResultPopup('Kamu tidak bisa membuat penawaran saat masih memiliki pinjaman aktif sebagai peminjam.');
                const memberSnap = await database.ref(`members/${key}`).once('value');
                const freshMember = memberSnap.val() || {};
                const transaction = await database.ref(`members/${key}/diamond`).transaction(v => {
                    const current = Number(v || 0);
                    if (current < amount) return;
                    return current - amount;
                });
                if (!transaction.committed) return showResultPopup('Diamond kamu tidak cukup untuk menahan nominal pinjaman.');
                escrowDeducted = true;
                const offerId = playerLoanOffersRef.push().key;
                const member = globalMembersData[key] || freshMember;
                await playerLoanOffersRef.child(offerId).set({memberKey:key, memberName:member.nama || member.username || 'Player', amount, escrowAmount:amount, interest, days, createdAt:Date.now(), updatedAt:Date.now()});
                escrowDeducted = false;
                if (amountInput) amountInput.value = '';
                if (interestInput) interestInput.value = '';
                if (daysInput) daysInput.value = '5';
                closeModal('playerLoanEditorModal');
                try { await refreshLoanOffers(); }
                catch (refreshError) { console.error('Penawaran tersimpan, tetapi daftar pinjaman gagal diperbarui:', refreshError); }
                showResultPopup('Penawaran pinjaman player berhasil dibuat. Diamond telah ditahan dan form ditutup.');
            } catch(err) {
                if (escrowDeducted) {
                    try { await database.ref(`members/${key}/diamond`).transaction(v => Number(v || 0) + amount); }
                    catch (rollbackError) { console.error('Pengembalian escrow gagal:', rollbackError); }
                }
                console.error('Gagal menyimpan penawaran pinjaman player:', err);
                showResultPopup('Gagal menyimpan penawaran. Jika Diamond sempat ditahan, sistem akan mencoba mengembalikannya.');
            }
        }

        async function borrowPlayerLoan(offerId) {
            const borrowerKey = activeLoggedInMemberKey;
            if (!borrowerKey) return showResultPopup('Login dulu untuk mengajukan pinjaman.');
            const offer = globalPlayerLoanOffers[offerId];
            if (!offer || offer.memberKey === borrowerKey) return showResultPopup('Penawaran pinjaman tidak valid.');
            const active = [...Object.values(globalPlayerLoanContracts), ...Object.values(globalBankLoanContracts)].some(c => (c.borrowerKey === borrowerKey || c.lenderKey === borrowerKey) && ['Aktif','Memproses jatuh tempo','Tidak mampu membayar'].includes(c.status));
            if (active) return showResultPopup('Kamu harus menyelesaikan pinjaman aktif dan tidak boleh sedang menjadi pemberi pinjaman.');
            const lender = globalMembersData[offer.memberKey];
            const borrower = globalMembersData[borrowerKey];
            if (!lender || !borrower) return showResultPopup('Data akun pemberi atau peminjam tidak ditemukan.');
            const amount = Number(offer.amount || 0);
            if (!Number.isSafeInteger(amount) || amount < 1 || Number(offer.escrowAmount || 0) < amount) return showResultPopup('Diamond penawaran belum tersedia atau belum ditahan dengan benar.');
            if (!confirm(`Ambil pinjaman ${amount.toLocaleString('id-ID')} diamond dari ${offer.memberName}? Bunga ${offer.interest}% dan total pelunasan ${Math.ceil(amount*(1+Number(offer.interest||0)/100)).toLocaleString('id-ID')} diamond.`)) return;
            let offerClaimed = false;
            try {
                const claim = await playerLoanOffersRef.child(offerId).child('escrowAmount').transaction(value => Number(value || 0) >= amount ? 0 : undefined);
                if (!claim.committed) return showResultPopup('Penawaran sudah diambil atau tidak lagi tersedia.');
                offerClaimed = true;
                const freshBorrowerSnap = await database.ref(`members/${borrowerKey}`).once('value');
                const freshBorrower = freshBorrowerSnap.val() || {};
                const contract = { offerId, lenderKey: offer.memberKey, lenderName: offer.memberName || 'Player', borrowerKey, borrowerName: freshBorrower.nama || freshBorrower.username || 'Player', amount, interest: Number(offer.interest || 0), totalDue: Math.ceil(amount * (1 + Number(offer.interest || 0) / 100)), paidAmount: 0, days: Number(offer.days || 5), startedAt: Date.now(), dueAt: Date.now() + Number(offer.days || 5) * 86400000, status: 'Aktif' };
                const contractRef = playerLoanContractsRef.push();
                await database.ref().update({
                    [`members/${borrowerKey}/diamond`]: Number(freshBorrower.diamond || 0) + amount,
                    [`loanPlayerContracts/${contractRef.key}`]: contract
                });
                offerClaimed = false;
                try { await refreshLoanOffers(); }
                catch (refreshError) { console.error('Pinjaman aktif, tetapi daftar gagal diperbarui:', refreshError); }
                showResultPopup('Pinjaman aktif. Diamond sudah masuk ke dompet peminjam.');
            } catch (e) {
                if (offerClaimed) {
                    try { await playerLoanOffersRef.child(offerId).child('escrowAmount').transaction(value => Number(value || 0) === 0 ? amount : value); }
                    catch (rollbackError) { console.error('Pemulihan penawaran pinjaman gagal:', rollbackError); }
                }
                console.error('Pinjaman player gagal diproses:', e);
                showResultPopup('Pinjaman gagal diproses. Penawaran akan dipulihkan jika transaksi belum selesai.');
            }
        }

        async function payPlayerLoanInstallment(contractId) {
            const borrowerKey = activeLoggedInMemberKey;
            if (!borrowerKey) return showResultPopup('Login dulu.');
            const ref = playerLoanContractsRef.child(contractId);
            try {
                const snap = await ref.once('value');
                const c = snap.val();
                if (!c || c.status !== 'Aktif' || c.borrowerKey !== borrowerKey) return showResultPopup('Hanya akun peminjam yang bisa membayar cicilan pinjaman ini.');
                const remain = Math.max(0, Number(c.totalDue || 0) - Number(c.paidAmount || 0));
                const memberSnap = await database.ref(`members/${borrowerKey}`).once('value');
                const member = memberSnap.val() || {};
                const maxPay = Math.min(remain, Math.floor(Number(member.diamond || 0)));
                if (maxPay <= 0) return showResultPopup('Diamond kamu belum cukup untuk membayar cicilan.');
                const entered = prompt(`Sisa pinjaman ${remain.toLocaleString('id-ID')} diamond. Saldo kamu ${Number(member.diamond||0).toLocaleString('id-ID')}. Masukkan jumlah cicilan (maks. ${maxPay.toLocaleString('id-ID')}):`, String(maxPay));
                if (entered === null) return;
                const payment = Number(entered);
                if (!Number.isSafeInteger(payment) || payment < 1 || payment > maxPay) return showResultPopup('Jumlah cicilan tidak valid atau diamond tidak cukup.');
                const lenderSnap = await database.ref(`members/${c.lenderKey}`).once('value');
                const lender = lenderSnap.val();
                if (!lender) return showResultPopup('Akun pemberi pinjaman tidak ditemukan.');
                const paidAmount = Number(c.paidAmount || 0) + payment;
                const isPaid = paidAmount >= Number(c.totalDue || 0);
                const updates = {};
                updates[`members/${borrowerKey}/diamond`] = Number(member.diamond || 0) - payment;
                updates[`members/${c.lenderKey}/diamond`] = Number(lender.diamond || 0) + payment;
                updates[`loanPlayerContracts/${contractId}/paidAmount`] = paidAmount;
                const paymentAt = Date.now();
                const paymentId = playerLoanContractsRef.child(contractId).child('paymentHistory').push().key;
                updates[`loanPlayerContracts/${contractId}/lastPaymentAt`] = paymentAt;
                updates[`loanPlayerContracts/${contractId}/paymentHistory/${paymentId}`] = { amount: payment, at: paymentAt, memberName: member.nama || member.username || 'Peminjam' };
                if (isPaid) { updates[`loanPlayerContracts/${contractId}/status`] = 'Lunas'; updates[`loanPlayerContracts/${contractId}/paidAt`] = Date.now(); }
                await database.ref().update(updates);
                try { await refreshLoanOffers(); } catch (refreshError) { console.error('Cicilan tersimpan, tetapi daftar pinjaman gagal diperbarui:', refreshError); }
                showResultPopup(isPaid ? 'Pinjaman lunas! Card akan dihapus setelah 1 hari.' : `Cicilan berhasil dibayar. Sisa ${ (Number(c.totalDue||0)-paidAmount).toLocaleString('id-ID') } diamond.`);
            } catch (e) { showResultPopup('Pembayaran cicilan gagal.'); }
        }

        async function borrowBankLoan(offerId) {
            const borrowerKey=activeLoggedInMemberKey; if(!borrowerKey) return showResultPopup('Login dulu untuk mengajukan pinjaman bank.');
            if([...Object.values(globalPlayerLoanContracts),...Object.values(globalBankLoanContracts)].some(c=>(c.borrowerKey===borrowerKey||c.lenderKey===borrowerKey)&&c.status==='Aktif')) return showResultPopup('Satu akun hanya boleh memiliki satu pinjaman aktif.');
            const offer=globalBankLoanOffers[offerId]; if(!offer) return showResultPopup('Pilihan pinjaman tidak tersedia.');
            const amount=Number(offer.amount||0), interest=Number(offer.interest||0), totalDue=Math.ceil(amount*(1+interest/100));
            if(!confirm(`Ajukan pinjaman bank ${amount.toLocaleString('id-ID')} diamond dengan bunga ${interest}%? Total pelunasan ${totalDue.toLocaleString('id-ID')} diamond. Pinjaman bank tidak memiliki tenggang waktu.`)) return;
            try { const snap=await database.ref(`members/${borrowerKey}`).once('value'); const m=snap.val()||{}; const contractRef=bankLoanContractsRef.push(); const contract={offerId,lenderKey:'bank',lenderName:'Bank Resmi',borrowerKey,borrowerName:m.nama||m.username||'Player',amount,interest,totalDue,paidAmount:0,startedAt:Date.now(),status:'Aktif'}; await database.ref().update({[`members/${borrowerKey}/diamond`]:Number(m.diamond||0)+amount,[`loanBankContracts/${contractRef.key}`]:contract}); await refreshLoanOffers(); showResultPopup('Pinjaman bank aktif dan diamond telah masuk ke dompet.'); } catch(e) { showResultPopup('Pengajuan pinjaman bank gagal.'); }
        }
        async function payBankLoanInstallment(contractId) {
            const key=activeLoggedInMemberKey; if(!key) return showResultPopup('Login dulu.');
            try { const ref=bankLoanContractsRef.child(contractId); const snap=await ref.once('value'); const c=snap.val(); if(!c||c.status!=='Aktif'||c.borrowerKey!==key) return showResultPopup('Hanya akun peminjam yang bisa membayar cicilan.'); const ms=await database.ref(`members/${key}`).once('value'); const m=ms.val()||{}; const remain=Math.max(0,Number(c.totalDue||0)-Number(c.paidAmount||0)); const maxPay=Math.min(remain,Math.floor(Number(m.diamond||0))); if(maxPay<=0) return showResultPopup('Diamond kamu belum cukup untuk membayar cicilan.'); const entered=prompt(`Sisa utang ${remain.toLocaleString('id-ID')}. Masukkan cicilan (maks. ${maxPay.toLocaleString('id-ID')}):`,String(maxPay)); if(entered===null)return; const payment=Number(entered); if(!Number.isSafeInteger(payment)||payment<1||payment>maxPay)return showResultPopup('Jumlah cicilan tidak valid.'); const paid=Number(c.paidAmount||0)+payment, done=paid>=Number(c.totalDue||0), updates={[`members/${key}/diamond`]:Number(m.diamond||0)-payment,[`loanBankContracts/${contractId}/paidAmount`]:paid,[`loanBankContracts/${contractId}/lastPaymentAt`]:Date.now()}; if(done){updates[`loanBankContracts/${contractId}/status`]='Lunas';updates[`loanBankContracts/${contractId}/paidAt`]=Date.now();} await database.ref().update(updates); await refreshLoanOffers(); showResultPopup(done?'Pinjaman bank lunas! Card dihapus setelah 1 hari.':`Cicilan dibayar. Sisa ${Math.max(0,Number(c.totalDue||0)-paid).toLocaleString('id-ID')} diamond.`); } catch(e){showResultPopup('Pembayaran cicilan bank gagal.');}
        }

        async function adminAddBankLoanOffer() {
            if (!isAdminLoggedIn) return showResultPopup('Login admin dulu.');
            const name = document.getElementById('adminBankLoanName').value.trim();
            const amount = Number(document.getElementById('adminBankLoanAmount').value);
            const interest = Number(document.getElementById('adminBankLoanInterest').value);
            if (!name || !Number.isSafeInteger(amount) || amount < 1 || !Number.isFinite(interest) || interest < 0 || interest > 1000) return showResultPopup('Isi nama, nominal lebih dari 0, dan bunga 0–1000%.');
            try {
                await bankLoanOffersRef.push({name, amount, interest, createdAt:Date.now()});
                document.getElementById('adminBankLoanName').value='';
                document.getElementById('adminBankLoanAmount').value='';
                document.getElementById('adminBankLoanInterest').value='';
                await refreshLoanOffers();
                showResultPopup('Pilihan pinjaman resmi berhasil ditambahkan.');
            } catch(err) { showResultPopup('Gagal menambahkan pinjaman resmi.'); }
        }

        async function adminDeleteBankLoanOffer(id) {
            if (!isAdminLoggedIn || !id) return;
            try { await bankLoanOffersRef.child(id).remove(); await refreshLoanOffers(); showResultPopup('Pilihan pinjaman resmi dihapus.'); }
            catch(err) { showResultPopup('Gagal menghapus pilihan pinjaman resmi.'); }
        }
