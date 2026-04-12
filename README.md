# English Battle Royale 🎮

Game web tĩnh chạy bằng **HTML + CSS + JavaScript thuần**, phù hợp để deploy trực tiếp lên **GitHub Pages**.

## Có gì trong bản này

- 4 đội chơi, giao diện glassmorphism neon dễ bấm trên máy chiếu/laptop.
- 28 ô câu hỏi, trong đó tự random **4 ô bất ngờ**.
- Timer 15 giây cho lượt chính, 5 giây cho cướp lượt.
- Trả lời đúng nhận tiền, đạn và được chọn hành động sau câu hỏi.
- Hệ shop: nâng cấp súng, mua item, dùng item trực tiếp trên giao diện.
- Streak 3 câu đúng liên tiếp sẽ mở **rương tiếp viện**.
- Tự động kích hoạt **Phase 2: 2vs2** khi còn 14 câu hoặc có đội còn 50 HP trở xuống.
- Autosave bằng `localStorage`.
- Có thể nhập câu hỏi bằng JSON ngay trong giao diện setup.

## Cân bằng đang dùng

### Chỉ số khởi đầu

- Máu: `100 HP`
- Tiền: `$0`
- Đạn: `1 ammo`
- Vũ khí mặc định: `USP`

### Reward khi trả lời đúng

- Lượt chính: `+$50` và `+1 ammo`
- Cướp lượt: `+$50`
- Sau đó đội chọn một hành động:
  - Khai hỏa
  - Tích đạn
  - Hồi máu
  - Mở shop

### Sát thương vũ khí

| Vũ khí | Damage | Giá nâng cấp |
|---|---:|---:|
| USP | 12 | Mặc định |
| MP-40 | 18 | $100 |
| AK-47 | 28 | $180 |
| AWM | 45 | $300 |

> AWM có khả năng xuyên khiên.

### Item shop

| Item | Giá | Tác dụng |
|---|---:|---|
| Ammo +1 | $30 | +1 ammo ngay |
| Medkit | $70 | Hồi 35 HP khi dùng |
| Khiên | $80 | Chặn 1 đòn |
| Flashbang | $100 | Khóa 1 đội ở câu kế tiếp |
| Phản đạn | $110 | Phản 50% damage hit kế |
| Berserk | $120 | Phát bắn kế miễn ammo, +10 damage |
| C4 | $130 | Gài bom áp lực lên đối thủ |
| Thief Card | $140 | Cướp 50% tiền và 1 ammo |

## Format JSON câu hỏi

Bạn có thể nhập JSON trong popup setup, ví dụ:

```json
[
  {
    "category": "Grammar",
    "prompt": "What is the past tense of go?",
    "answer": "went"
  },
  {
    "category": "Vocabulary",
    "prompt": "Translate 'môi trường' into English.",
    "answer": "environment",
    "surprise": true
  }
]
```

- Nếu không đủ 28 câu, game sẽ tự bù từ bộ mẫu.
- Nếu nhiều hơn 28 câu, game lấy 28 câu đầu.
- Nếu không đánh dấu `surprise`, game sẽ tự random đủ 4 ô bất ngờ.

## Cách chạy local

Chỉ cần mở file `index.html` bằng trình duyệt.

## Deploy bằng GitHub Pages

### Cách nhanh nhất

1. Tạo repository mới trên GitHub.
2. Upload toàn bộ file trong thư mục này lên nhánh `main`.
3. Vào **Settings** → **Pages**.
4. Ở mục **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Save.
6. Chờ GitHub Pages build xong và mở link website của repo.

### Cấu trúc file tối thiểu

- `index.html`
- `styles.css`
- `app.js`
- `questions.js`
- `.nojekyll`

## Mẹo dùng trên lớp

- Bật fullscreen trình duyệt để bảng câu hỏi trông đẹp hơn.
- Nếu host lỡ bấm nhầm ô, dùng nút `✕` trong popup câu hỏi để đóng mà không tiêu tốn câu.
- Dùng nút `Âm thanh` để bật/tắt hiệu ứng timer.
- Dùng `Xóa autosave` nếu muốn bắt đầu từ trạng thái hoàn toàn sạch.

Chúc project của bạn bùng nổ trong lớp học 🚀
