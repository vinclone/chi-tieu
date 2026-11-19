# Ứng Dụng Quản Lý Chi Tiêu Chuyến Đi Nhóm (Group Trip Expense Manager)

Một ứng dụng web hoàn chỉnh, hiện đại và bảo mật dành cho việc chia tiền, quản lý thu chi và quyết toán công nợ khi đi du lịch, dã ngoại, ăn uống hay sinh hoạt nhóm. Ứng dụng thay thế hoàn toàn bảng tính Google Sheets thủ công bằng giao diện trực quan, tự động hóa 100% công thức tính toán và gợi ý chuyển khoản tối ưu nhất.

---

## 🌟 Tính Năng Nổi Bật

### 1. Quản lý đa chuyến đi / Nhóm độc lập
- Tạo, chỉnh sửa, lưu trữ (archive), khôi phục và xóa nhiều chuyến đi (Đà Lạt 2026, Phú Quốc, Sinh nhật, Đi phượt...).
- Mỗi chuyến đi có ngân sách (budget), ngày đi/về, địa điểm, thành viên, chi phí và lịch sử quyết toán hoàn toàn độc lập.
- Tích hợp sẵn bộ dữ liệu mẫu thực tế **Chuyến đi Đà Lạt 2026** (5 thành viên, 10 khoản chi đầy đủ các hình thức chia tiền).

### 2. 4 Phương thức chia tiền linh hoạt (Split Methods)
- **Chia đều (Equal Split)**: Tự động chia đều cho các thành viên được chọn; giải quyết triệt để số dư lẻ 1 VNĐ để tổng các phần bằng đúng 100% số tiền chi tiêu.
- **Tùy chỉnh số tiền (Custom Amount)**: Tự nhập số tiền cho từng người, có bảng đối soát chênh lệch tức thì.
- **Theo phần trăm (Percentage Split)**: Nhập tỷ lệ % (tổng 100%), tự động quy đổi ra VNĐ và làm tròn chính xác.
- **Theo số phần / Trọng số (Weighted Shares)**: Cho phép gán số phần (ví dụ người uống nhiều bia chịu 2 phần, người không uống chịu 1 phần).
- Người thanh toán **không bắt buộc** phải là người tham gia hưởng thụ khoản chi đó.
- Xem trước trực tiếp (Live Preview) số tiền từng người phải trả trước khi bấm lưu.

### 3. Tối ưu hóa quyết toán công nợ (Min-Cash-Flow Algorithm)
- Tự động phân tích ai đang nợ tiền, ai được nhận lại tiền.
- Sử dụng thuật toán đồ thị tham lam (Greedy Bipartite Matching) để triệt tiêu nợ chéo, giảm thiểu tối đa số giao dịch chuyển khoản giữa các thành viên.
- Nút **"Đánh dấu đã trả"** tiện lợi: hỗ trợ trả từng phần, ghi nhận phương thức thanh toán (Chuyển khoản, Tiền mặt, Ví MoMo/ZaloPay), tự động kích hoạt hiệu ứng pháo hoa chúc mừng khi tất cả đã tất toán.
- Nút **"Sao chép tổng kết gửi nhóm"**: Tạo mẫu tin nhắn ngắn gọn, lịch sự, định dạng chuẩn để gửi ngay vào nhóm Zalo, Messenger, Telegram.

### 4. Giao diện kép: Modern Card View & Spreadsheet View
- **Card View**: Trực quan, nổi bật danh mục và biểu tượng đại diện.
- **Spreadsheet View**: Lấy cảm hứng từ Google Sheets với hàng dữ liệu gọn gàng, thanh tiêu đề ghim cố định (sticky header), lọc và thao tác nhanh (nhân bản, xóa hàng loạt).

### 5. Thống kê & Phân tích chi tiêu (Visual Analytics)
- Biểu đồ Donut SVG trực quan tỷ trọng chi tiêu theo từng danh mục.
- Biểu đồ cột dòng thời gian chi tiêu theo từng ngày của chuyến đi.
- Biểu đồ so sánh đóng góp tài chính: Thực chi (Paid) vs Trách nhiệm (Share) của từng người.
- Bảng vinh danh Top 5 khoản chi lớn nhất.
- Đo lường mức độ sử dụng ngân sách dự kiến.

### 6. Lưu trữ Offline & Sao lưu JSON / CSV
- Hoạt động 100% trên trình duyệt thông qua `LocalStorage` — không cần internet, không cần tài khoản, dữ liệu riêng tư tuyệt đối.
- **Sao lưu & Phục hồi JSON**: Tải tệp `.json` về máy hoặc tải lên để khôi phục dữ liệu (hỗ trợ kiểm tra tính hợp lệ, xem trước thống kê và lựa chọn Ghi đè hoặc Gộp dữ liệu).
- **Xuất tệp CSV (Excel)**: Hỗ trợ mã hóa UTF-8 BOM hiển thị chuẩn tiếng Việt có dấu trong Microsoft Excel cho Khoản chi, Tổng kết thành viên và Lịch sử quyết toán.

---

## 📐 Công Thức Tính Toán Tài Chính

Tất cả các phép tính hoạt động trên số nguyên VNĐ:

1. **Tổng tiền đã chi của thành viên \(i\)**:
   $$\text{Paid}_i = \sum_{\text{payer} = i} \text{Số tiền chi}$$

2. **Tổng tiền phải chịu của thành viên \(i\)**:
   $$\text{Share}_i = \sum_{\text{splits có } i} \text{Phần tiền chia}_i$$

3. **Số dư ròng (Net Balance)**:
   $$\text{Balance}_i = (\text{Paid}_i - \text{Share}_i) + \sum \text{Tiền đã trả nợ}_i - \sum \text{Tiền nợ đã nhận}_i$$
   - $\text{Balance}_i > 0$: Thành viên được nhận lại tiền.
   - $\text{Balance}_i < 0$: Thành viên cần chuyển trả tiền.
   - $\text{Balance}_i = 0$: Thành viên đã cân bằng tài chính.

4. **Bảo toàn cân bằng tài chính (Reconciliation Invariant)**:
   $$\sum_{i \in \text{Nhóm}} \text{Balance}_i \equiv 0$$

---

## 🛠 Hướng Dẫn Cài Đặt & Chạy Trên Windows (PowerShell)

### Yêu cầu môi trường
- NodeJS v18+ trở lên
- Trình quản lý gói `npm`

### Các bước thực hiện

1. Mở cửa sổ **Windows PowerShell** và chuyển đến thư mục dự án:
   ```powershell
   cd "d:\codelam\chi tieu"
   ```

2. Cài đặt các thư viện phụ thuộc:
   ```powershell
   npm install
   ```

3. Khởi chạy máy chủ phát triển (Dev Server):
   ```powershell
   npm run dev
   ```
   Ứng dụng sẽ hiển thị đường dẫn `http://localhost:5173/`. Mở trình duyệt để trải nghiệm!

4. Chạy kiểm thử tự động (Unit Tests):
   ```powershell
   npm test
   ```

5. Đóng gói bản Production:
   ```powershell
   npm run build
   ```

---

## 📁 Cấu Trúc Mã Nguồn

```text
src/
├── context/
│   ├── AppContext.jsx          # Quản lý trạng thái nhóm, thành viên, chi phí, quyết toán
│   └── ToastContext.jsx        # Thông báo nổi (Toasts)
├── services/
│   ├── storageService.js       # Tương tác LocalStorage, backup/restore JSON
│   ├── exportService.js        # Tạo tệp CSV chuẩn tiếng Việt cho Excel
│   └── seedData.js             # Dữ liệu mẫu Chuyến đi Đà Lạt 2026
├── utils/
│   ├── currency.js             # Định dạng tiền tệ VNĐ (vi-VN)
│   ├── date.js                 # Định dạng ngày giờ tiếng Việt
│   ├── calculations.js         # Động cơ tính toán chia tiền, số dư, tỷ trọng
│   ├── settlementAlgorithm.js  # Thuật toán tối ưu hóa chuyển tiền min-cash-flow
│   └── validators.js           # Kiểm tra tính hợp lệ của biểu mẫu
├── components/
│   ├── common/                 # Modal, ConfirmDialog, CurrencyDisplay, EmptyState, PageHeader
│   ├── layout/                 # Sidebar, Header, MobileNav, AppLayout
│   ├── dashboard/              # SummaryCards, GroupOverviewCard, MemberSpendingTable, RecentExpensesList
│   ├── expenses/               # ExpenseFormModal, ExpenseCardView, ExpenseSpreadsheetView, ExpenseFilters
│   ├── members/                # MemberList, MemberFormModal, MemberDetailDrawer
│   ├── settlements/            # SuggestedTransfers, SettlementRecordModal, SettlementHistory, CopySummaryButton
│   ├── statistics/             # CategoryDonutChart, DailySpendingBarChart, MemberBalanceChart, TopExpensesList
│   └── groups/                 # GroupFormModal, GroupSwitcherModal
├── pages/
│   ├── DashboardPage.jsx
│   ├── ExpensesPage.jsx
│   ├── MembersPage.jsx
│   ├── SettlementPage.jsx
│   ├── StatisticsPage.jsx
│   └── SettingsPage.jsx
├── __tests__/                  # Bộ test tự động Vitest cho logic chia tiền và tối ưu nợ
├── App.jsx
├── main.jsx
└── index.css
```
