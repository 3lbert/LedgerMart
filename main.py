import random
import time
from shop_timer import run_day_timer

# -------------------- Classes --------------------

class GlobalCost:
    def __init__(self, uang_awal=1000, sewa=50, listrik=20):
        self.uang = uang_awal
        self.sewa = sewa
        self.listrik = listrik

class Barang:
    def __init__(self, nama, harga_beli, harga_jual, stok=10):
        self.nama = nama
        self.harga_beli = harga_beli
        self.harga_jual = harga_jual
        self.stok = stok

class Pembeli:
    def __init__(self):
        self.belanja = {}
        self.uang = random.randint(20, 100) # Pelanggan punya uang terbatas

    def beli(self, barang, jumlah):
        # This method now just performs the transaction
        if barang.stok >= jumlah:
            barang.stok -= jumlah
            self.belanja[barang.nama] = self.belanja.get(barang.nama, 0) + jumlah
            return barang.harga_jual * jumlah
        return 0

class Pendapatan:
    def __init__(self):
        self.total_penjualan = 0
        self.total_hpp = 0
        self.gross_margin = 0
        self.net_profit = 0

    def hitung(self, barang_terjual, biaya_sewa, biaya_listrik):
        self.total_penjualan = sum([item["jual"] for item in barang_terjual])
        self.total_hpp = sum([item["beli"] for item in barang_terjual])
        self.gross_margin = self.total_penjualan - self.total_hpp
        self.net_profit = self.gross_margin - (biaya_sewa + biaya_listrik)
        return self.net_profit

# -------------------- Game Engine --------------------

class ToserbaGame:
    def __init__(self):
        self.global_cost = GlobalCost()
        self.barang_list = [
            Barang("Sampo", 5, 8, 10),
            Barang("Sabun Mandi", 3, 5, 10),
            Barang("Sikat Gigi", 2, 4, 10),
            Barang("Snack", 4, 7, 10),
            Barang("Coklat", 6, 9, 10),
            Barang("Pasta Gigi", 3, 6, 10),
            Barang("Air Mineral", 1, 2, 10),
            Barang("Lampu", 10, 15, 10),
            Barang("Sabun Cuci Piring", 4, 7, 10),
            Barang("Batu Baterai", 2, 4, 10),
        ]
        self.hari = 1
        self.weather = self.get_weather()

    def get_weather(self):
        return random.choice(["Cerah", "Hujan"])

    def get_profit_bar(self, profit):
        if profit > 0:
            bar = "🟩" * int(profit / 10)
            return f"Profit: +{profit} {bar}"
        elif profit < 0:
            bar = "🟥" * int(abs(profit) / 10)
            return f"Loss: {profit} {bar}"
        else:
            return "Profit: 0"

    def alien_attack_event(self):
        num_aliens = random.randint(5, 7)
        print(f"\n👽 ALIEN INVASION! Ada {num_aliens} alien menyerbu toko!")

        for i in range(num_aliens):
            available_items = [b for b in self.barang_list if b.stok > 0]
            if not available_items:
                print("Alien pergi karena tidak ada barang lagi untuk dicuri.")
                break

            target_item = random.choice(available_items)
            taps_needed = random.randint(8, 15)  # More aggressive

            print(f"\nAlien #{i+1} mencoba mencuri {target_item.nama}!")

            try:
                action = input(f"Tekan Enter {taps_needed} kali untuk mengusirnya! (Ketik 'lepas' untuk menyerah): ").lower()
                if action == 'lepas':
                    raise EOFError

                for tap in range(taps_needed - 1):
                    input(f"[{'#' * (tap + 2):<15}] Tekan Enter... [{tap + 2}/{taps_needed}]")

                print(f"Berhasil mengusir alien #{i+1}!")

            except (KeyboardInterrupt, EOFError):
                print(f"\nKamu membiarkan alien #{i+1} kabur!")
                stolen_amount = min(target_item.stok, random.randint(2, 5))
                target_item.stok -= stolen_amount
                print(f"Alien itu berhasil mencuri {stolen_amount} {target_item.nama}!")

        # Kidnap customer and steal profit
        if random.random() < 0.4: # 40% chance
            print("\nSatu alien berhasil menculik pelanggan!")
            # This will be reflected by reducing the number of customers for the day.
        
        if random.random() < 0.5: # 50% chance
            stolen_profit = int(self.global_cost.uang * random.uniform(0.1, 0.3))
            self.global_cost.uang -= stolen_profit
            print(f"\nSial! Alien juga mencuri {stolen_profit} dari profitmu!")

        print("\nSituasi kembali aman (untuk saat ini).")

    def thief_event(self):
        num_thieves = random.randint(2, 4) # Reduced for balance
        print(f"\n🚨 ALARM! Ada {num_thieves} maling masuk ke toko! Usir mereka!")
        
        for i in range(num_thieves):
            # BUG FIX: Check for available items inside the loop
            available_items = [b for b in self.barang_list if b.stok > 0]
            if not available_items:
                print("Maling kabur karena tidak ada barang lagi untuk dicuri.")
                break

            target_item = random.choice(available_items)
            taps_needed = random.randint(5, 10) # Reduced for better gameplay
            
            print(f"\nMaling #{i+1} mencoba mencuri {target_item.nama}!")
            
            # Simplified input challenge
            try:
                # Give user option to give up
                action = input(f"Tekan Enter {taps_needed} kali untuk mengusirnya! (Ketik 'lepas' untuk menyerah): ").lower()
                if action == 'lepas':
                    raise EOFError # Trigger the failure case

                for tap in range(taps_needed - 1): # First Enter press is counted
                    input(f"[{'#' * (tap + 2):<10}] Tekan Enter... [{tap + 2}/{taps_needed}]")
                
                print(f"Berhasil mengusir maling #{i+1}!")

            except (KeyboardInterrupt, EOFError):
                 print(f"\nKamu membiarkan maling #{i+1} kabur!")
                 stolen_amount = min(target_item.stok, random.randint(1, 3))
                 target_item.stok -= stolen_amount
                 print(f"Maling itu berhasil mencuri {stolen_amount} {target_item.nama}!")

        print("\nSituasi kembali aman.")

    def simulate_day(self):
        print(f"\n📅 Hari {self.hari} dimulai...")
        print(f"Cuaca hari ini: {self.weather}")
        print(f"Biaya harian (Sewa: {self.global_cost.sewa}, Listrik: {self.global_cost.listrik}) akan dipotong dari profit.")
        pendapatan = Pendapatan()
        barang_terjual = []

        # Random Thief Event
        if self.hari > 1 and random.random() < 0.3: # 30% chance after day 1
            self.thief_event()

        # Alien Attack Event
        if self.hari > 2 and random.random() < 0.2: # 20% chance after day 2
            self.alien_attack_event()

        # Simulasi pembeli
        num_pembeli = random.randint(3, 8)
        print(f"Ada {num_pembeli} pembeli hari ini.")

        # Adjust item desirability based on weather
        item_weights = [1] * len(self.barang_list)
        if self.weather == "Hujan":
            # Randomly select 1 or 2 items to be in high demand
            num_hot_items = random.randint(1, 2)
            hot_items = random.sample(self.barang_list, num_hot_items)
            hot_item_names = [item.nama for item in hot_items]
            
            print(f"Karena hujan, orang-orang lebih banyak mencari {', '.join(hot_item_names)}.")

            for i, barang in enumerate(self.barang_list):
                if barang.nama in hot_item_names:
                    item_weights[i] = 5 # 5x more likely to be chosen

        for i in range(num_pembeli):
            pembeli = Pembeli()
            gender = random.choice(['Laki-laki', 'Perempuan'])
            
            # BUG FIX: Pembeli memilih barang yang ada stoknya
            available_items = [b for b in self.barang_list if b.stok > 0]
            if not available_items:
                print("Tidak ada lagi barang yang tersedia untuk dibeli.")
                break
            
            # Apply weighted random choice
            barang = random.choices(self.barang_list, weights=item_weights, k=1)[0]
            
            # BUG FIX: Pembeli tidak akan membeli lebih dari stok yang ada
            max_buy = min(3, barang.stok)
            if max_buy == 0:
                continue
            jumlah = random.randint(1, max_buy)

            print(f"\n({i+1}/{num_pembeli}) Seorang pembeli {gender} datang.")

            # Shopping Bubble
            print(r" /------------------------\ ")
            print(r" |  📝 Shopping List      | ")
            print(r" |------------------------| ")
            print(f" |  - {barang.nama}: {jumlah:<12} | ")
            print(r" \------------------------/ ")
            time.sleep(1)

            # Customer purchase logic based on price
            max_willing_price = barang.harga_beli * 1.8 # Willing to pay up to 80% markup
            will_buy = False
            if barang.harga_jual <= max_willing_price:
                will_buy = True
            elif random.random() < 0.3: # 30% chance to buy even if expensive
                print(f"--> '{barang.nama}' harganya agak mahal, tapi ya sudahlah...")
                will_buy = True
            
            if will_buy:
                hasil = pembeli.beli(barang, jumlah)
                if hasil > 0:
                    print(f"--> Pembeli berhasil membeli {jumlah} {barang.nama}.")
                    barang_terjual.append({
                        "nama": barang.nama,
                        "jual": hasil,
                        "beli": barang.harga_beli * jumlah
                    })
            else:
                print(f"--> Harga {barang.nama} terlalu mahal! Pembeli tidak jadi beli.")

        # Hitung pendapatan
        profit = pendapatan.hitung(
            barang_terjual,
            self.global_cost.sewa,
            self.global_cost.listrik
        )
        self.global_cost.uang += profit

        # Hasil hari ini
        print("\n--- Laporan Harian ---")
        print("Penjualan Hari Ini:")
        if not barang_terjual:
            print("- Tidak ada penjualan hari ini.")
        for b in barang_terjual:
            print(f"- {b['nama']}: +{b['jual']} (HPP: {b['beli']})")

        print(f"\nGross Margin: {pendapatan.gross_margin}")
        print(f"Biaya Sewa: -{self.global_cost.sewa}")
        print(f"Biaya Listrik: -{self.global_cost.listrik}")
        print(f"Net Profit: {pendapatan.net_profit}")
        print(self.get_profit_bar(pendapatan.net_profit))
        print(f"💰 Uang Toko: {self.global_cost.uang}")

        # Cek kondisi
        if self.global_cost.uang <= 0:
            print("🚨 Bangkrut! Game Over.")
            return False

        self.hari += 1
        self.weather = self.get_weather() # Update weather for the next day
        return True

    def restock(self):
        print("\n--- Fase Restock ---")
        print(f"Uang Anda saat ini: {self.global_cost.uang}")
        for barang in self.barang_list:
            print(f"\nBarang: {barang.nama} (Stok: {barang.stok}, Harga Beli: {barang.harga_beli})")
            
            while True:
                try:
                    jumlah_str = input(f"Berapa {barang.nama} yang ingin dibeli? (0 untuk lewati): ")
                    jumlah = int(jumlah_str)
                    if jumlah < 0:
                        print("Tidak bisa membeli dalam jumlah negatif.")
                        continue
                    
                    biaya = jumlah * barang.harga_beli
                    if biaya > self.global_cost.uang:
                        print(f"Uang tidak cukup. Anda hanya punya {self.global_cost.uang}.")
                        continue
                    
                    barang.stok += jumlah
                    self.global_cost.uang -= biaya
                    if jumlah > 0:
                        print(f"Berhasil membeli {jumlah} {barang.nama}.")
                    break
                except ValueError:
                    print("Input tidak valid. Masukkan angka.")
        print("\n--- Fase Restock Selesai ---")

    def set_prices(self):
        print("\n--- Fase Pengaturan Harga ---")
        
        while True:
            new_prices = {}
            for barang in self.barang_list:
                print(f"\nBarang: {barang.nama} (Harga Beli: {barang.harga_beli}, Harga Jual Saat Ini: {barang.harga_jual})")
                
                while True:
                    try:
                        harga_str = input(f"Masukkan harga jual baru untuk {barang.nama} (kosongkan untuk lewati): ")
                        if not harga_str:
                            break
                        
                        harga_baru = int(harga_str)
                        if harga_baru < 0:
                            print("Harga tidak boleh negatif!")
                            continue

                        if harga_baru < barang.harga_beli:
                            print(f"Peringatan: Harga jual ({harga_baru}) lebih rendah dari harga beli ({barang.harga_beli}). Anda akan rugi.")
                        
                        new_prices[barang.nama] = harga_baru
                        print(f"Harga jual sementara untuk {barang.nama} adalah {harga_baru}.")
                        break 
                    except ValueError:
                        print("Input tidak valid. Masukkan angka.")

            if not new_prices:
                print("\nTidak ada perubahan harga.")
                break

            print("\n--- Konfirmasi Perubahan Harga ---")
            for barang in self.barang_list:
                if barang.nama in new_prices:
                    print(f"- {barang.nama}: {barang.harga_jual} -> {new_prices[barang.nama]}")
                else:
                    print(f"- {barang.nama}: {barang.harga_jual} (tidak berubah)")

            while True:
                konfirmasi = input("Apakah Anda yakin dengan perubahan ini? (y/n): ").lower()
                if konfirmasi in ['y', 'n']:
                    break
                else:
                    print("Input tidak valid. Masukkan 'y' atau 'n'.")

            if konfirmasi == 'y':
                for barang in self.barang_list:
                    if barang.nama in new_prices:
                        barang.harga_jual = new_prices[barang.nama]
                print("Harga telah diperbarui.")
                break
            else: 
                print("Perubahan harga dibatalkan. Mari kita coba lagi.\n")
        
        print("\n--- Fase Pengaturan Harga Selesai ---")

    def update_stock_prices(self):
        print("\n--- Pembaruan Harga Stok Harian ---")
        print("Harga beli untuk beberapa item telah meningkat!")
        for barang in self.barang_list:
            increase = random.randint(1, 2)
            barang.harga_beli += increase
            print(f"- Harga beli {barang.nama} naik menjadi {barang.harga_beli}.")

# -------------------- Main Loop --------------------

if __name__ == "__main__":
    game = ToserbaGame()
    DAY_DURATION_SECONDS = 10  # Setiap hari berlangsung 10 detik

    for day in range(7):
        if not game.simulate_day():
            break
        
        # Update stock prices at the end of the day
        game.update_stock_prices()

        # Fase restock di akhir hari
        game.restock()
        
        # Fase pengaturan harga
        game.set_prices()

        if day < 6: # Jangan jalankan timer di hari terakhir
            print(f"\n--- Akhir Hari {game.hari - 1}. Hari berikutnya akan segera dimulai. ---\n")
            run_day_timer(DAY_DURATION_SECONDS)

    print("\n--- Game Selesai setelah 7 hari ---")