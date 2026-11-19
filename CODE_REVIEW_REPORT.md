# BÁO CÁO CODE REVIEW TOÀN DIỆN & KIỂM THỬ HỆ THỐNG
## Dự án: Group Trip Expense Manager (ReactJS + JSON)

**Chuyên gia thực hiện:** Senior Software Engineer / Frontend Architect & Financial Systems Auditor  
**Thời gian kiểm định:** 19/11/2026  
**Môi trường thử nghiệm:** Windows PowerShell, NodeJS v24.15.0, Vite 8.3.8, React 19.3.1, Vitest 3.2.7  

---

## 1. PROJECT OVERVIEW

Dự án **Group Trip Expense Manager** là một ứng dụng web Single-Page Application (SPA) phát triển bằng ReactJS, Vite, Tailwind CSS và Lucide Icons, hướng tới việc thay thế bảng tính Google Sheets thủ công cho các chuyến đi chơi, du lịch hay dã ngoại nhóm. 

### Các đặc tính cốt lõi đã kiểm chứng:
- **Kiến trúc Zero-Backend**: Dữ liệu lưu trữ hoàn toàn tại client trong `localStorage`, bảo đảm tính riêng tư và khả năng hoạt động offline 100%.
- **Toán học tài chính số nguyên VNĐ**: Triệt tiêu lỗi dấu phẩy động (floating-point precision errors), bảo toàn nguyên tắc $\sum \text{phần chia} \equiv \text{khoản chi}$ và $\sum \text{số dư nhóm} \equiv 0$.
- **4 Cơ chế chia tiền linh hoạt**: Chia đều (Equal), Tùy chỉnh (Custom), Phần trăm (Percentage), Theo phần (Weighted).
- **Thuật toán đồ thị tham lam tối ưu hóa thanh toán (Min-Cash-Flow)**: Giảm thiểu số giao dịch chuyển tiền cần thực hiện giữa các thành viên.
- **Giao diện kép**: Chuyển đổi giữa chế độ thẻ trực quan (Card View) và bảng tính chuyên nghiệp (Google Sheets Spreadsheet View).
- **Bảo mật & Sao lưu**: Xuất/nhập file sao lưu JSON an toàn với màn hình xem trước (preview), xuất báo cáo CSV mã hóa UTF-8 BOM hiển thị chuẩn tiếng Việt trên Microsoft Excel.

---

## 2. ARCHITECTURE ASSESSMENT

### Đánh giá cấu trúc & Tổ chức mã nguồn
- **Phân tách trách nhiệm (Separation of Concerns)**: Code được phân lớp rõ ràng giữa tầng dữ liệu/lưu trữ (`src/services/`), tầng tính toán nghiệp vụ (`src/utils/`), tầng context toàn cục (`src/context/`), và tầng giao diện (`src/components/`, `src/pages/`).
- **State Management**: Sử dụng React Context API kết hợp các hook `useMemo`, `useCallback` giúp đồng bộ mượt mà giữa các trang mà không gây hiện tượng prop-drilling hay rò rỉ bộ nhớ.
- **Không lạm dụng `App.jsx`**: `App.jsx` đóng vai trò là root shell điều hướng mỏng gọn (dưới 60 dòng code), toàn bộ logic quản lý dữ liệu được đóng gói chuẩn mực trong `AppContext.jsx` và `ToastContext.jsx`.
- **Tập trung hóa LocalStorage**: Mọi thao tác đọc/ghi `localStorage` được cách ly tuyệt đối trong `storageService.js`. Không có component giao diện nào gọi trực tiếp `localStorage.getItem` hay `localStorage.setItem`.

---

## 3. FINANCIAL LOGIC ASSESSMENT

### 3.1 Tính toán phân bổ chi phí (Expense Splits)
- **Chia đều (Equal Split)**: Kiểm tra phân chia $100.000$ đ cho 3 người ($33.334$ đ, $33.333$ đ, $33.333$ đ) -> Tổng khớp chính xác $100.000$ đ. Thử nghiệm với $1$ đ cho 3 người ($1$ đ, $0$ đ, $0$ đ) -> Tổng khớp $1$ đ.
- **Tùy chỉnh số tiền (Custom Split)**: Đã bổ sung cơ chế kiểm soát số tiền âm (`< 0`) và đối soát chênh lệch tức thì; chặn lưu nếu tổng chia lệch dù chỉ $1$ đ.
- **Theo phần trăm (Percentage Split)**: Kiểm tra tổng tỷ lệ 100%, tự động làm tròn số tiền và bù trừ chênh lệch làm tròn vào phần tử lớn nhất để bảo toàn tổng chi.
- **Theo trọng số (Weighted Split)**: Chia theo tỷ lệ phần (weights $\ge 1$), phần dư nguyên được phân phối tham lam theo phần thập phân lớn nhất.
- **Khoản chi loại trừ người trả**: Khi người trả không nằm trong danh sách người hưởng thụ, số dư của người trả tăng đúng bằng toàn bộ số tiền chi, người tham gia chịu phần tương ứng. Kết quả đối soát toàn nhóm luôn bằng $0$.

### 3.2 Thuật toán Quyết toán công nợ (Min-Cash-Flow Settlement)
- Thuật toán phân lập chính xác tập người nợ (Debtors, balance $< 0$) và người được nhận (Creditors, balance $> 0$).
- Tối ưu hóa số lần chuyển khoản thành công theo đúng ví dụ thực tế trong yêu cầu kỹ thuật:
  - Vinh: $+500.000$ đ, Minh: $+200.000$ đ, Khoa: $-400.000$ đ, Huy: $-300.000$ đ
  - Gợi ý giao dịch: Khoa $\to$ Vinh: $400.000$ đ, Huy $\to$ Vinh: $100.000$ đ, Huy $\to$ Minh: $200.000$ đ (Tổng đúng $700.000$ đ, chỉ mất 3 giao dịch thay vì 6 giao dịch nợ chéo).
- **Quy tắc không thanh toán vượt quá số dư nợ (Section 3.4)**: Đã bổ sung logic kiểm tra nghiêm ngặt ngăn chặn thành viên có số dư dương hoặc cân bằng thực hiện trả nợ, cũng như chặn thanh toán số tiền lớn hơn khoản nợ thực tế.

---

## 4. JSON & LOCALSTORAGE ASSESSMENT

- **Schema Versioning**: Bản ghi lưu trữ có trường `version: 1` và tự động bổ sung các mảng rỗng khi thiếu trường.
- **Khả năng tự phục hồi (Self-Healing)**: Nếu dữ liệu LocalStorage bị lỗi cú pháp hoặc bị sửa hỏng bên ngoài, `storageService.loadData()` tự động bắt lỗi bằng khối `try/catch` và nạp lại dữ liệu an toàn mà không làm sập ứng dụng (crash).
- **Xử lý Orphan ID**: Đã bổ sung kiểm tra `activeGroupId` hợp lệ; nếu `activeGroupId` trỏ tới ID không tồn tại trong danh sách nhóm, hệ thống tự động gán về nhóm đầu tiên.
- **Kiểm định tệp Import JSON**: Hàm `validateImportedData` thực hiện duyệt sâu (deep validation) kiểm tra cấu trúc mảng, tính duy nhất của ID (phát hiện trùng ID nhóm, thành viên, khoản chi) và số tiền không âm.

---

## 5. CRUD & VALIDATION ASSESSMENT

- **Nhóm (Group)**: Tạo, cập nhật, lưu trữ (archive), khôi phục và xóa (có xác nhận cảnh báo).
- **Thành viên (Member)**: Thêm, sửa, xem chi tiết và xóa an toàn. Nếu thành viên đã phát sinh chi tiêu hoặc quyết toán, hệ thống tự động chuyển trạng thái `status: 'removed'` để giữ nguyên vẹn sổ sách tài chính lịch sử.
- **Khoản chi (Expense)**: Thêm, sửa, xóa, nhân bản (duplicate) và xóa hàng loạt (bulk delete).
- **Quyết toán (Settlement)**: Tạo mới, cập nhật chỉnh sửa (Update Settlement - đã bổ sung đầy đủ) và hoàn tác/hủy giao dịch.
- **Kiểm soát tầng nghiệp vụ**: Đã bổ sung kiểm tra tính hợp lệ của `splits` và tính toàn vẹn của giao dịch ở tầng validator nghiệp vụ (`src/utils/validators.js`), không phụ thuộc đơn thuần vào form HTML.

---

## 6. UI/UX & RESPONSIVE ASSESSMENT

- **Thiết kế SaaS hiện đại**: Tông màu chủ đạo Emerald `#10B981` cho tài chính/thành công, Rose `#EF4444` cho công nợ/cảnh báo, nền xám nhạt tối giản, viền bo tròn mềm mại.
- **Bảng tính Spreadsheet View**: Có thanh tiêu đề ghim cố định (`sticky`), hỗ trợ bấm vào các tiêu đề cột (Ngày, Tên khoản chi, Danh mục, Người trả, Số tiền) để sắp xếp tăng/giảm trực tiếp.
- **Responsive Đa thiết bị**:
  - Desktop: Sidebar điều hướng cố định bên trái, hỗ trợ chuyển nhóm nhanh.
  - Mobile/Tablet: Thanh điều hướng dưới đáy màn hình (Bottom Navigation), bảng tính có thanh trượt ngang chống tràn màn hình.
- **Tương tác người dùng**: Có hộp thoại xác nhận (ConfirmDialog) cho mọi thao tác hủy/xóa, thông báo nổi (Toast Notification) phản hồi ngay lập tức, và hiệu ứng pháo hoa khi hoàn tất quyết toán.

---

## 7. CODE QUALITY & PERFORMANCE

- Đã giải quyết triệt để cảnh báo Immutability trong React Compiler tại biểu đồ `CategoryDonutChart`.
- Đã dọn dẹp toàn bộ 12 imports không sử dụng trên toàn dự án.
- Sử dụng `React.useMemo` cho bảng tra cứu `memberMap` trong Bảng tính Spreadsheet giúp tránh tính toán lại không cần thiết trên mỗi chu kỳ render.
- Đã thêm phần mở rộng `.js` chuẩn hóa cho các tệp module trong `src/utils/`.

---

## 8. TESTING RESULTS

Chạy toàn bộ 4 test suite với công cụ **Vitest v3.2.7**:

```powershell
npm test
```

**Kết quả thực tế 100% Passed:**
```text
 ✓ src/__tests__/storageService.test.js (5 tests)
 ✓ src/__tests__/calculations.test.js (10 tests)
 ✓ src/__tests__/validationAndEdgeCases.test.js (24 tests)
 ✓ src/__tests__/settlementAlgorithm.test.js (3 tests)

 Test Files  4 passed (4)
      Tests  42 passed (42)
   Duration  738ms
```

### Kiểm tra đóng gói Production Build:
```powershell
npm run build
```
**Kết quả:** Thành công trong **1.36s**, kích thước gzip 114 kB, sẵn sàng triển khai.

---

## 9. DANH SÁCH LỖI ĐÃ PHÁT HIỆN & PHÂN LOẠI (BUG LIST)

| Bug ID | Mức độ | Tệp nguồn | Thành phần / Hàm | Mô tả lỗi | Hướng xử lý | Trạng thái |
|---|---|---|---|---|---|---|
| **BUG-01** | **CRITICAL** | `src/components/expenses/ExpenseFormModal.jsx` | `ExpenseFormModal` | Khi chỉnh sửa khoản chi mà người trả hoặc người tham gia đã chuyển sang `status: 'removed'`, dropdown và danh sách bỏ sót họ, dẫn đến lưu đè người trả hoặc mất người tham gia khỏi split. | Tạo `selectableMembers` bao gồm thành viên active và các thành viên lịch sử đã gắn với khoản chi đó kèm nhãn `(Đã rời nhóm)`. | **ĐÃ SỬA** |
| **BUG-02** | **HIGH** | `src/utils/validators.js` & `SettlementRecordModal.jsx` | `validateSettlement` | Thiếu kiểm tra số tiền thanh toán vượt quá số dư nợ theo Section 3.4; cho phép nhập số tiền lớn hơn khoản nợ hoặc thanh toán khi không có nợ. | Bổ sung kiểm tra `options.memberBalances`, tính toán trần nợ tối đa và chặn lưu kèm thông báo lỗi rõ ràng. | **ĐÃ SỬA** |
| **BUG-03** | **HIGH** | `src/context/AppContext.jsx` & `SettlementHistory.jsx` | `updateSettlement` | Thiếu hàm cập nhật quyết toán và thiếu nút "Sửa" trong lịch sử; người dùng buộc phải xóa rồi tạo lại nếu nhập sai thông tin. | Bổ sung `updateSettlement` vào Context, thêm nút Sửa (Edit) trong lịch sử và hỗ trợ edit mode trong modal. | **ĐÃ SỬA** |
| **BUG-04** | **HIGH** | `src/utils/validators.js` | `validateExpense` | Tầng nghiệp vụ không xác thực tính toàn vẹn của mảng `splits` (tổng phần chia so với số tiền, kiểm tra số âm, splitType hợp lệ). | Thêm xác thực chi tiết mảng `splits` và `splitType` trong `validateExpense`. | **ĐÃ SỬA** |
| **BUG-05** | **MEDIUM** | `src/utils/calculations.js` | `calculateExpenseShares` | Khi số tiền bằng 0, hàm trả về `valid: true`, cho phép các khoản chi 0đ vượt qua tính toán; âm tiền tùy chỉnh bị tự động ép về 0 mà không báo lỗi. | Trả về `valid: false` khi `amount <= 0` và bắt lỗi `hasNegative` trong custom split. | **ĐÃ SỬA** |
| **BUG-06** | **MEDIUM** | `ExpenseSpreadsheetView.jsx` | `ExpenseSpreadsheetView` | Các tiêu đề cột trong bảng Spreadsheet tĩnh, không thể bấm sắp xếp trực tiếp (Date, Title, Category, Payer, Amount). | Bổ sung state `sortField`, `sortDirection`, icon `ArrowUpDown` và logic sắp xếp tiếng Việt đa cột. | **ĐÃ SỬA** |
| **BUG-07** | **MEDIUM** | `src/services/storageService.js` | `loadData` & `applyBackup` | Nếu `activeGroupId` trỏ tới ID không tồn tại trong danh sách nhóm, nó vẫn bị giữ lại trong state dưới dạng orphan ID. | Thêm bước tự động gán `activeGroupId` về nhóm đầu tiên nếu ID không tồn tại trong danh sách nhóm. | **ĐÃ SỬA** |
| **BUG-08** | **MEDIUM** | `CategoryDonutChart.jsx` | `CategoryDonutChart` | Gán đè biến `currentOffset` trong vòng lặp `.map()` gây cảnh báo Immutability trong React Compiler. | Chuyển sang tính toán mảng phân đoạn SVG bằng hàm `reduce` thuần túy (pure function). | **ĐÃ SỬA** |
| **BUG-09** | **LOW** | `CurrencyDisplay.jsx` | `CurrencyDisplay` | Khai báo biến `badgeClass`, `isZero` nhưng không dùng; thiếu prop `badge` cho giao diện dạng pill. | Bổ sung prop `badge` cho phép hiển thị dạng chip/badge viền màu và dọn biến thừa. | **ĐÃ SỬA** |
| **BUG-10** | **LOW** | Nhiều tệp giao diện | Các trang và component | Cảnh báo linter về các import không dùng (`formatCurrency`, `Users`, `Award`, `Trophy`, `Filter`, v.v.). | Dọn dẹp toàn bộ các import thừa trên tất cả các tệp. | **ĐÃ SỬA** |
| **BUG-11** | **LOW** | `settlementAlgorithm.js` | Imports | Thiếu đuôi mở rộng `.js` khiến Node.js ESM thuần không thể import trực tiếp. | Thêm đầy đủ phần mở rộng `.js` cho các import nội bộ. | **ĐÃ SỬA** |

---

## 10. CÁC TỆP ĐÃ ĐƯỢC CHỈNH SỬA & BỔ SUNG

1. `src/utils/calculations.js`: Sửa điều kiện số tiền $\le 0$, bắt lỗi số âm trong custom split.
2. `src/utils/settlementAlgorithm.js`: Chuẩn hóa import `.js`.
3. `src/utils/validators.js`: Mở rộng xác thực mảng splits, kiểm tra trần nợ thanh toán, kiểm tra sâu cấu trúc import JSON.
4. `src/context/AppContext.jsx`: Bổ sung `updateSettlement` và xử lý an toàn cập nhật.
5. `src/components/expenses/ExpenseFormModal.jsx`: Hỗ trợ `selectableMembers` cho thành viên đã rời nhóm, thêm nút "Điền mẫu chia đều".
6. `src/components/expenses/ExpenseSpreadsheetView.jsx`: Bổ sung sắp xếp cột tương tác dạng bảng tính Google Sheets, memoize `memberMap`.
7. `src/components/settlements/SettlementRecordModal.jsx`: Hỗ trợ chế độ chỉnh sửa giao dịch và tích hợp kiểm tra trần nợ.
8. `src/components/settlements/SettlementHistory.jsx`: Bổ sung nút "Sửa" và tích hợp xác nhận.
9. `src/pages/SettlementPage.jsx`: Đồng bộ luồng chỉnh sửa quyết toán, dọn dẹp import.
10. `src/services/storageService.js`: Sửa phục hồi orphan `activeGroupId`.
11. `src/components/statistics/CategoryDonutChart.jsx`: Khắc phục cảnh báo immutability bằng hàm reduce thuần túy.
12. `src/components/common/CurrencyDisplay.jsx`: Bổ sung prop `badge` và dọn dẹp biến thừa.
13. `src/services/exportService.js`: Dọn import thừa.
14. `src/components/dashboard/SummaryCards.jsx`: Dọn import thừa.
15. `src/components/members/MemberList.jsx`: Dọn import thừa.
16. `src/components/members/MemberDetailDrawer.jsx`: Dọn import thừa.
17. `src/pages/DashboardPage.jsx`: Dọn import thừa.
18. `src/pages/StatisticsPage.jsx`: Dọn import thừa.
19. `src/pages/SettingsPage.jsx`: Dọn import thừa.
20. `src/__tests__/storageService.test.js`: Cập nhật test case kiểm tra tự phục hồi orphan ID.
21. `src/__tests__/validationAndEdgeCases.test.js` (**TỆP MỚI**): 24 bài kiểm thử chuyên sâu cho validation và edge cases tài chính.

---

## 11. BẢNG TỔNG HỢP ĐÁNH GIÁ (FINAL AUDIT MATRIX)

| Hạng mục kiểm tra | Trạng thái | Chi tiết đánh giá |
|---|:---:|---|
| **Architecture** | **PASS** | Phân tầng rõ ràng, Zero-backend, State management qua Context sạch sẽ, không rò rỉ LocalStorage. |
| **Financial Logic** | **PASS** | Số nguyên VNĐ chính xác 100%, bảo toàn $\sum \text{splits} \equiv \text{amount}$ và $\sum \text{balances} \equiv 0$. |
| **Settlement** | **PASS** | Thuật toán Min-Cash-Flow tối ưu đúng số lần chuyển tiền, hỗ trợ thanh toán 1 phần và chặn trả vượt quá nợ. |
| **JSON Storage** | **PASS** | Lưu trữ LocalStorage ổn định, tự phục hồi lỗi, có preview backup và kiểm tra trùng ID. |
| **CRUD Operations** | **PASS** | Đầy đủ 100% thao tác cho Nhóm, Thành viên, Chi tiêu và Quyết toán (bao gồm Create, Read, Update, Delete). |
| **Validation** | **PASS** | Kiểm soát chặt chẽ ở cả tầng Service/Nghiệp vụ và tầng Giao diện Form. |
| **UI/UX Design** | **PASS** | SaaS hiện đại, phối màu chuẩn tài chính, bảng tính Google Sheets chuyên nghiệp, thông báo Toast đầy đủ. |
| **Responsive** | **PASS** | Tương thích mượt mà từ Desktop tới Mobile, thanh điều hướng đáy, chống tràn bảng. |
| **Testing** | **PASS** | 42/42 tests tự động đạt 100% trên Vitest. |
| **Production Build** | **PASS** | Đóng gói Vite hoàn tất trong 1.36s, 0 lỗi, 0 cảnh báo nghiêm trọng. |

---

## 12. KẾT LUẬN CUỐI CÙNG

Dự án **Group Trip Expense Manager** đã vượt qua tất cả các tiêu chí kiểm thử kỹ thuật và nghiệp vụ tài chính khắt khe nhất. Mã nguồn hiện tại đạt độ tin cậy cao, kiến trúc chuẩn mực, hiệu năng tối ưu và sẵn sàng đưa vào sử dụng thực tế cho mọi nhu cầu quản lý chi tiêu nhóm bạn bè.
