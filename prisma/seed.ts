import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const hsk1Words = [
  { hanzi: '我', pinyin: 'wǒ', meaning: 'tôi, tao', hskLevel: 1, examples: [{ sentence: '我是学生。', pinyin: 'Wǒ shì xuésheng.', meaning: 'Tôi là học sinh.' }], tags: ['đại từ'] },
  { hanzi: '你', pinyin: 'nǐ', meaning: 'bạn, mày', hskLevel: 1, examples: [{ sentence: '你好！', pinyin: 'Nǐ hǎo!', meaning: 'Xin chào!' }], tags: ['đại từ'] },
  { hanzi: '他', pinyin: 'tā', meaning: 'anh ấy', hskLevel: 1, examples: [{ sentence: '他是老师。', pinyin: 'Tā shì lǎoshī.', meaning: 'Anh ấy là giáo viên.' }], tags: ['đại từ'] },
  { hanzi: '她', pinyin: 'tā', meaning: 'cô ấy', hskLevel: 1, examples: [{ sentence: '她很漂亮。', pinyin: 'Tā hěn piàoliang.', meaning: 'Cô ấy rất đẹp.' }], tags: ['đại từ'] },
  { hanzi: '好', pinyin: 'hǎo', meaning: 'tốt, tốt lành', hskLevel: 1, examples: [{ sentence: '你好！', pinyin: 'Nǐ hǎo!', meaning: 'Xin chào!' }], tags: ['tính từ'] },
  { hanzi: '是', pinyin: 'shì', meaning: 'là (động từ)', hskLevel: 1, examples: [{ sentence: '这是书。', pinyin: 'Zhè shì shū.', meaning: 'Đây là sách.' }], tags: ['động từ'] },
  { hanzi: '不', pinyin: 'bù', meaning: 'không', hskLevel: 1, examples: [{ sentence: '我不去。', pinyin: 'Wǒ bù qù.', meaning: 'Tôi không đi.' }], tags: ['phó từ'] },
  { hanzi: '的', pinyin: 'de', meaning: 'của (trợ từ)', hskLevel: 1, examples: [{ sentence: '我的书', pinyin: 'Wǒ de shū', meaning: 'Sách của tôi' }], tags: ['trợ từ'] },
  { hanzi: '在', pinyin: 'zài', meaning: 'ở, đang ở', hskLevel: 1, examples: [{ sentence: '我在家。', pinyin: 'Wǒ zài jiā.', meaning: 'Tôi ở nhà.' }], tags: ['động từ'] },
  { hanzi: '有', pinyin: 'yǒu', meaning: 'có', hskLevel: 1, examples: [{ sentence: '我有一本书。', pinyin: 'Wǒ yǒu yī běn shū.', meaning: 'Tôi có một quyển sách.' }], tags: ['động từ'] },
  { hanzi: '人', pinyin: 'rén', meaning: 'người', hskLevel: 1, examples: [{ sentence: '他是好人。', pinyin: 'Tā shì hǎo rén.', meaning: 'Anh ấy là người tốt.' }], tags: ['danh từ'] },
  { hanzi: '大', pinyin: 'dà', meaning: 'lớn, to', hskLevel: 1, examples: [{ sentence: '这个很大。', pinyin: 'Zhège hěn dà.', meaning: 'Cái này rất lớn.' }], tags: ['tính từ'] },
  { hanzi: '小', pinyin: 'xiǎo', meaning: 'nhỏ, bé', hskLevel: 1, examples: [{ sentence: '这只猫很小。', pinyin: 'Zhè zhī māo hěn xiǎo.', meaning: 'Con mèo này rất nhỏ.' }], tags: ['tính từ'] },
  { hanzi: '来', pinyin: 'lái', meaning: 'đến, tới', hskLevel: 1, examples: [{ sentence: '请进来。', pinyin: 'Qǐng jìn lái.', meaning: 'Mời vào.' }], tags: ['động từ'] },
  { hanzi: '去', pinyin: 'qù', meaning: 'đi, tới nơi xa', hskLevel: 1, examples: [{ sentence: '我去学校。', pinyin: 'Wǒ qù xuéxiào.', meaning: 'Tôi đi trường.' }], tags: ['động từ'] },
  { hanzi: '吃', pinyin: 'chī', meaning: 'ăn', hskLevel: 1, examples: [{ sentence: '我想吃面条。', pinyin: 'Wǒ xiǎng chī miàntiáo.', meaning: 'Tôi muốn ăn mì.' }], tags: ['động từ'] },
  { hanzi: '喝', pinyin: 'hē', meaning: 'uống', hskLevel: 1, examples: [{ sentence: '你喝水吗？', pinyin: 'Nǐ hē shuǐ ma?', meaning: 'Bạn uống nước không?' }], tags: ['động từ'] },
  { hanzi: '学', pinyin: 'xué', meaning: 'học', hskLevel: 1, examples: [{ sentence: '我学汉语。', pinyin: 'Wǒ xué Hànyǔ.', meaning: 'Tôi học tiếng Trung.' }], tags: ['động từ'] },
  { hanzi: '说', pinyin: 'shuō', meaning: 'nói', hskLevel: 1, examples: [{ sentence: '他说汉语。', pinyin: 'Tā shuō Hànyǔ.', meaning: 'Anh ấy nói tiếng Trung.' }], tags: ['động từ'] },
  { hanzi: '看', pinyin: 'kàn', meaning: 'xem, nhìn', hskLevel: 1, examples: [{ sentence: '我看书。', pinyin: 'Wǒ kàn shū.', meaning: 'Tôi đọc sách.' }], tags: ['động từ'] },
  { hanzi: '爱', pinyin: 'ài', meaning: 'yêu', hskLevel: 1, examples: [{ sentence: '我爱你。', pinyin: 'Wǒ ài nǐ.', meaning: 'Tôi yêu bạn.' }], tags: ['động từ'] },
  { hanzi: '朋友', pinyin: 'péngyǒu', meaning: 'bạn bè', hskLevel: 1, examples: [{ sentence: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyǒu.', meaning: 'Anh ấy là bạn tôi.' }], tags: ['danh từ'] },
  { hanzi: '学生', pinyin: 'xuésheng', meaning: 'học sinh, sinh viên', hskLevel: 1, examples: [{ sentence: '我是学生。', pinyin: 'Wǒ shì xuésheng.', meaning: 'Tôi là học sinh.' }], tags: ['danh từ'] },
  { hanzi: '老师', pinyin: 'lǎoshī', meaning: 'giáo viên', hskLevel: 1, examples: [{ sentence: '她是老师。', pinyin: 'Tā shì lǎoshī.', meaning: 'Cô ấy là giáo viên.' }], tags: ['danh từ'] },
  { hanzi: '妈妈', pinyin: 'māma', meaning: 'mẹ', hskLevel: 1, examples: [{ sentence: '妈妈做饭。', pinyin: 'Māma zuò fàn.', meaning: 'Mẹ nấu cơm.' }], tags: ['danh từ', 'gia đình'] },
  { hanzi: '爸爸', pinyin: 'bàba', meaning: 'bố, ba', hskLevel: 1, examples: [{ sentence: '爸爸很忙。', pinyin: 'Bàba hěn máng.', meaning: 'Bố rất bận.' }], tags: ['danh từ', 'gia đình'] },
  { hanzi: '中国', pinyin: 'Zhōngguó', meaning: 'Trung Quốc', hskLevel: 1, examples: [{ sentence: '我来自中国。', pinyin: 'Wǒ láizì Zhōngguó.', meaning: 'Tôi đến từ Trung Quốc.' }], tags: ['danh từ'] },
  { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: 'tiếng Trung', hskLevel: 1, examples: [{ sentence: '我学汉语。', pinyin: 'Wǒ xué Hànyǔ.', meaning: 'Tôi học tiếng Trung.' }], tags: ['danh từ'] },
  { hanzi: '今天', pinyin: 'jīntiān', meaning: 'hôm nay', hskLevel: 1, examples: [{ sentence: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', meaning: 'Hôm nay thời tiết đẹp.' }], tags: ['danh từ', 'thời gian'] },
  { hanzi: '水', pinyin: 'shuǐ', meaning: 'nước', hskLevel: 1, examples: [{ sentence: '我喝水。', pinyin: 'Wǒ hē shuǐ.', meaning: 'Tôi uống nước.' }], tags: ['danh từ'] },
]

const hsk2Words = [
  { hanzi: '高兴', pinyin: 'gāoxìng', meaning: 'vui mừng', hskLevel: 2, examples: [{ sentence: '我很高兴认识你。', pinyin: 'Wǒ hěn gāoxìng rènshi nǐ.', meaning: 'Tôi rất vui được gặp bạn.' }], tags: ['tính từ'] },
  { hanzi: '知道', pinyin: 'zhīdào', meaning: 'biết', hskLevel: 2, examples: [{ sentence: '我不知道。', pinyin: 'Wǒ bù zhīdào.', meaning: 'Tôi không biết.' }], tags: ['động từ'] },
  { hanzi: '喜欢', pinyin: 'xǐhuān', meaning: 'thích', hskLevel: 2, examples: [{ sentence: '我喜欢音乐。', pinyin: 'Wǒ xǐhuān yīnyuè.', meaning: 'Tôi thích âm nhạc.' }], tags: ['động từ'] },
  { hanzi: '觉得', pinyin: 'juéde', meaning: 'cảm thấy', hskLevel: 2, examples: [{ sentence: '我觉得很好。', pinyin: 'Wǒ juéde hěn hǎo.', meaning: 'Tôi cảm thấy rất tốt.' }], tags: ['động từ'] },
  { hanzi: '问题', pinyin: 'wèntí', meaning: 'câu hỏi, vấn đề', hskLevel: 2, examples: [{ sentence: '有问题吗？', pinyin: 'Yǒu wèntí ma?', meaning: 'Có câu hỏi không?' }], tags: ['danh từ'] },
  { hanzi: '工作', pinyin: 'gōngzuò', meaning: 'làm việc', hskLevel: 2, examples: [{ sentence: '他在工作。', pinyin: 'Tā zài gōngzuò.', meaning: 'Anh ấy đang làm việc.' }], tags: ['động từ', 'danh từ'] },
  { hanzi: '时候', pinyin: 'shíhou', meaning: 'lúc, khi nào', hskLevel: 2, examples: [{ sentence: '你什么时候来？', pinyin: 'Nǐ shénme shíhou lái?', meaning: 'Khi nào bạn đến?' }], tags: ['danh từ'] },
  { hanzi: '一起', pinyin: 'yīqǐ', meaning: 'cùng nhau', hskLevel: 2, examples: [{ sentence: '我们一起去吧。', pinyin: 'Wǒmen yīqǐ qù ba.', meaning: 'Chúng ta cùng đi nhé.' }], tags: ['phó từ'] },
  { hanzi: '已经', pinyin: 'yǐjīng', meaning: 'đã rồi', hskLevel: 2, examples: [{ sentence: '我已经吃了。', pinyin: 'Wǒ yǐjīng chī le.', meaning: 'Tôi đã ăn rồi.' }], tags: ['phó từ'] },
  { hanzi: '还是', pinyin: 'háishì', meaning: 'hay là', hskLevel: 2, examples: [{ sentence: '喝茶还是咖啡？', pinyin: 'Hē chá háishì kāfēi?', meaning: 'Uống trà hay cà phê?' }], tags: ['liên từ'] },
  { hanzi: '因为', pinyin: 'yīnwèi', meaning: 'vì, bởi vì', hskLevel: 2, examples: [{ sentence: '因为下雨，我没去。', pinyin: 'Yīnwèi xià yǔ, wǒ méi qù.', meaning: 'Vì trời mưa nên tôi không đi.' }], tags: ['liên từ'] },
  { hanzi: '所以', pinyin: 'suǒyǐ', meaning: 'vì vậy, nên', hskLevel: 2, examples: [{ sentence: '所以我来了。', pinyin: 'Suǒyǐ wǒ lái le.', meaning: 'Vì vậy tôi đã đến.' }], tags: ['liên từ'] },
  { hanzi: '但是', pinyin: 'dànshì', meaning: 'nhưng mà', hskLevel: 2, examples: [{ sentence: '我想去，但是没时间。', pinyin: 'Wǒ xiǎng qù, dànshì méi shíjiān.', meaning: 'Tôi muốn đi nhưng không có thời gian.' }], tags: ['liên từ'] },
  { hanzi: '如果', pinyin: 'rúguǒ', meaning: 'nếu như', hskLevel: 2, examples: [{ sentence: '如果你来，我很高兴。', pinyin: 'Rúguǒ nǐ lái, wǒ hěn gāoxìng.', meaning: 'Nếu bạn đến thì tôi rất vui.' }], tags: ['liên từ'] },
  { hanzi: '帮助', pinyin: 'bāngzhù', meaning: 'giúp đỡ', hskLevel: 2, examples: [{ sentence: '谢谢你的帮助。', pinyin: 'Xièxiè nǐ de bāngzhù.', meaning: 'Cảm ơn sự giúp đỡ của bạn.' }], tags: ['động từ', 'danh từ'] },
]

const hsk3Words = [
  { hanzi: '其实', pinyin: 'qíshí', meaning: 'thực ra', hskLevel: 3, examples: [{ sentence: '其实我不太喜欢。', pinyin: 'Qíshí wǒ bù tài xǐhuān.', meaning: 'Thực ra tôi không thích lắm.' }], tags: ['phó từ'] },
  { hanzi: '终于', pinyin: 'zhōngyú', meaning: 'cuối cùng', hskLevel: 3, examples: [{ sentence: '我终于明白了。', pinyin: 'Wǒ zhōngyú míngbái le.', meaning: 'Cuối cùng tôi đã hiểu.' }], tags: ['phó từ'] },
  { hanzi: '简单', pinyin: 'jiǎndān', meaning: 'đơn giản', hskLevel: 3, examples: [{ sentence: '这很简单。', pinyin: 'Zhè hěn jiǎndān.', meaning: 'Điều này rất đơn giản.' }], tags: ['tính từ'] },
  { hanzi: '复杂', pinyin: 'fùzá', meaning: 'phức tạp', hskLevel: 3, examples: [{ sentence: '这个问题很复杂。', pinyin: 'Zhège wèntí hěn fùzá.', meaning: 'Vấn đề này rất phức tạp.' }], tags: ['tính từ'] },
  { hanzi: '重要', pinyin: 'zhòngyào', meaning: 'quan trọng', hskLevel: 3, examples: [{ sentence: '这很重要。', pinyin: 'Zhè hěn zhòngyào.', meaning: 'Điều này rất quan trọng.' }], tags: ['tính từ'] },
  { hanzi: '方便', pinyin: 'fāngbiàn', meaning: 'tiện lợi', hskLevel: 3, examples: [{ sentence: '这样很方便。', pinyin: 'Zhèyàng hěn fāngbiàn.', meaning: 'Như vậy rất tiện lợi.' }], tags: ['tính từ'] },
  { hanzi: '认为', pinyin: 'rènwéi', meaning: 'cho rằng', hskLevel: 3, examples: [{ sentence: '我认为你是对的。', pinyin: 'Wǒ rènwéi nǐ shì duì de.', meaning: 'Tôi cho rằng bạn đúng.' }], tags: ['động từ'] },
  { hanzi: '解释', pinyin: 'jiěshì', meaning: 'giải thích', hskLevel: 3, examples: [{ sentence: '请解释一下。', pinyin: 'Qǐng jiěshì yīxià.', meaning: 'Xin hãy giải thích một chút.' }], tags: ['động từ'] },
  { hanzi: '练习', pinyin: 'liànxí', meaning: 'luyện tập', hskLevel: 3, examples: [{ sentence: '我每天练习汉语。', pinyin: 'Wǒ měitiān liànxí Hànyǔ.', meaning: 'Tôi luyện tập tiếng Trung mỗi ngày.' }], tags: ['động từ', 'danh từ'] },
  { hanzi: '进步', pinyin: 'jìnbù', meaning: 'tiến bộ', hskLevel: 3, examples: [{ sentence: '你进步很快！', pinyin: 'Nǐ jìnbù hěn kuài!', meaning: 'Bạn tiến bộ rất nhanh!' }], tags: ['động từ', 'danh từ'] },
]

const grammarLessons = [
  {
    id: 'grammar-hsk1-1',
    title: '是 shì - To Be',
    titleVi: 'Động từ 是 (shì) — Là',
    hskLevel: 1,
    order: 1,
    content: [
      { type: 'heading', content: 'Cấu trúc 是 (shì) — Là' },
      { type: 'text', content: 'Động từ "是" (shì) có nghĩa là "là". Dùng để nối chủ ngữ với danh từ.' },
      { type: 'pattern', content: '主语 + 是 + 名词', pinyin: 'Zhǔyǔ + shì + míngcí', translation: 'Chủ ngữ + là + danh từ' },
      { type: 'example', content: '我是学生。', pinyin: 'Wǒ shì xuésheng.', translation: 'Tôi là học sinh.' },
      { type: 'example', content: '他是老师。', pinyin: 'Tā shì lǎoshī.', translation: 'Anh ấy là giáo viên.' },
      { type: 'note', content: 'Phủ định: 不是 (bú shì). Ví dụ: 我不是学生。= Tôi không phải là học sinh.' },
      { type: 'tip', content: '是 không chia theo thì! Tiếng Trung không có chia động từ theo thì.' },
    ],
    exercises: [
      { id: 'ex1', type: 'multiple_choice', question: '"Tôi là học sinh" là?', options: ['他是学生。', '我是学生。', '你是老师。', '她是医生。'], answer: '我是学生。', explanation: '我 = tôi, 是 = là, 学生 = học sinh' },
      { id: 'ex2', type: 'fill_blank', question: '他___老师。(Anh ấy là giáo viên)', answer: '是', explanation: '是(shì) = là' },
      { id: 'ex3', type: 'multiple_choice', question: '"Cô ấy không phải học sinh" là?', options: ['她是学生。', '她不是学生。', '她是老师。', '她不学习。'], answer: '她不是学生。', explanation: '不是 = không phải là' },
    ],
  },
  {
    id: 'grammar-hsk1-2',
    title: '有 yǒu - Have / Exist',
    titleVi: 'Động từ 有 (yǒu) — Có',
    hskLevel: 1,
    order: 2,
    content: [
      { type: 'heading', content: '有 (yǒu) — Có' },
      { type: 'text', content: '有 có hai nghĩa: (1) sở hữu "có", (2) tồn tại "có, tồn tại".' },
      { type: 'pattern', content: '主语 + 有 + 宾语', pinyin: 'Zhǔyǔ + yǒu + bīnyǔ', translation: 'Chủ ngữ + có + tân ngữ' },
      { type: 'example', content: '我有一本书。', pinyin: 'Wǒ yǒu yī běn shū.', translation: 'Tôi có một quyển sách.' },
      { type: 'note', content: 'Phủ định: 没有 (méiyǒu). KHÔNG dùng 不有!' },
      { type: 'tip', content: 'Nhớ: 没有 (méiyǒu) = không có — phủ định duy nhất của 有' },
    ],
    exercises: [
      { id: 'ex1', type: 'multiple_choice', question: '"Tôi không có tiền" là?', options: ['我有钱。', '我不有钱。', '我没有钱。', '我没钱有。'], answer: '我没有钱。', explanation: '没有 là phủ định của 有' },
      { id: 'ex2', type: 'fill_blank', question: '我___一个哥哥。(Tôi có một anh trai)', answer: '有', explanation: '有 = có (sở hữu)' },
    ],
  },
  {
    id: 'grammar-hsk2-1',
    title: '比 bǐ - Comparison',
    titleVi: 'So sánh với 比 (bǐ)',
    hskLevel: 2,
    order: 1,
    content: [
      { type: 'heading', content: 'So sánh hơn — 比 (bǐ)' },
      { type: 'text', content: '比 dùng để so sánh hơn kém giữa hai đối tượng.' },
      { type: 'pattern', content: 'A + 比 + B + 形容词', pinyin: 'A + bǐ + B + xíngróngcí', translation: 'A hơn B về... (tính từ)' },
      { type: 'example', content: '他比我高。', pinyin: 'Tā bǐ wǒ gāo.', translation: 'Anh ấy cao hơn tôi.' },
      { type: 'example', content: '汉语比英语难。', pinyin: 'Hànyǔ bǐ Yīngyǔ nán.', translation: 'Tiếng Trung khó hơn tiếng Anh.' },
      { type: 'note', content: 'Phủ định dùng 没有: 我没有他高。= Tôi không cao bằng anh ấy.' },
    ],
    exercises: [
      { id: 'ex1', type: 'multiple_choice', question: '"Hôm nay nóng hơn hôm qua" là?', options: ['今天比昨天热。', '今天热比昨天。', '昨天比今天热。', '今天和昨天热。'], answer: '今天比昨天热。', explanation: 'A + 比 + B + tính từ' },
      { id: 'ex2', type: 'fill_blank', question: '苹果___橙子贵。(Táo đắt hơn cam)', answer: '比', explanation: '比 = so sánh hơn' },
    ],
  },
  {
    id: 'grammar-hsk2-2',
    title: '把 bǎ - Disposal Construction',
    titleVi: 'Cấu trúc 把 (bǎ) — Câu xử lý',
    hskLevel: 2,
    order: 2,
    content: [
      { type: 'heading', content: 'Cấu trúc 把 (bǎ)' },
      { type: 'text', content: '把 dùng để nhấn mạnh hành động tác động lên tân ngữ, đặt tân ngữ trước động từ.' },
      { type: 'pattern', content: '主语 + 把 + 宾语 + 动词 + 补语', pinyin: 'Zhǔyǔ + bǎ + bīnyǔ + dòngcí + bǔyǔ', translation: 'Chủ ngữ + đem/lấy + tân ngữ + động từ + bổ ngữ' },
      { type: 'example', content: '我把书放在桌子上。', pinyin: 'Wǒ bǎ shū fàng zài zhuōzi shàng.', translation: 'Tôi đặt quyển sách lên bàn.' },
      { type: 'note', content: 'Chỉ dùng 把 khi tân ngữ là xác định (đã biết). Không nói: 我把一本书放在桌子上 (sai vì "một quyển sách" chưa xác định).' },
    ],
    exercises: [
      { id: 'ex1', type: 'multiple_choice', question: '"Tôi đã uống hết nước" dùng 把 là?', options: ['我喝了水把。', '我把水喝完了。', '把水我喝完。', '我把完喝水了。'], answer: '我把水喝完了。', explanation: 'Chủ ngữ + 把 + tân ngữ + động từ + 完了' },
    ],
  },
  {
    id: 'grammar-hsk3-1',
    title: '虽然...但是... Concession',
    titleVi: 'Cặp từ 虽然...但是... (Tuy...nhưng...)',
    hskLevel: 3,
    order: 1,
    content: [
      { type: 'heading', content: '虽然...但是... — Tuy...nhưng...' },
      { type: 'text', content: 'Dùng để diễn đạt sự nhượng bộ: tuy có điều kiện A nhưng kết quả là B.' },
      { type: 'pattern', content: '虽然 + A，但是 + B', pinyin: 'Suīrán + A, dànshì + B', translation: 'Tuy A nhưng B' },
      { type: 'example', content: '虽然很难，但是很有趣。', pinyin: 'Suīrán hěn nán, dànshì hěn yǒuqù.', translation: 'Tuy khó nhưng rất thú vị.' },
      { type: 'tip', content: '虽然 đứng ở đầu mệnh đề thứ nhất. 但是 ở đầu mệnh đề thứ hai. Có thể bỏ 虽然 nhưng không bỏ 但是.' },
    ],
    exercises: [
      { id: 'ex1', type: 'multiple_choice', question: '"Tuy mệt nhưng vui" là?', options: ['虽然累，但是高兴。', '因为累，所以高兴。', '虽然高兴，但是累。', '不累但高兴。'], answer: '虽然累，但是高兴。', explanation: '虽然...但是... = tuy...nhưng...' },
      { id: 'ex2', type: 'fill_blank', question: '___他不说，我也知道。(Tuy anh ấy không nói, tôi cũng biết)', answer: '虽然', explanation: '虽然 đứng đầu mệnh đề nhượng bộ' },
    ],
  },
  {
    id: 'grammar-hsk3-2',
    title: '越来越 — More and More',
    titleVi: '越来越 (yuèláiyuè) — Ngày càng...',
    hskLevel: 3,
    order: 2,
    content: [
      { type: 'heading', content: '越来越 (yuèláiyuè) — Ngày càng...' },
      { type: 'text', content: 'Diễn đạt sự thay đổi liên tục theo hướng tăng dần.' },
      { type: 'pattern', content: '越来越 + 形容词/动词', pinyin: 'Yuèláiyuè + xíngróngcí/dòngcí', translation: 'Ngày càng + tính từ/động từ' },
      { type: 'example', content: '我的汉语越来越好了。', pinyin: 'Wǒ de Hànyǔ yuèláiyuè hǎo le.', translation: 'Tiếng Trung của tôi ngày càng tốt hơn.' },
      { type: 'tip', content: 'Thường đi kèm với 了 ở cuối câu để chỉ sự thay đổi.' },
    ],
    exercises: [
      { id: 'ex1', type: 'multiple_choice', question: '"Thời tiết ngày càng lạnh" là?', options: ['天气越来越冷。', '天气很冷。', '天气比以前冷。', '天气越冷越好。'], answer: '天气越来越冷。', explanation: '越来越 + tính từ = ngày càng...' },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  for (const word of [...hsk1Words, ...hsk2Words, ...hsk3Words]) {
    await prisma.vocabulary.upsert({
      where: { id: `seed-${word.hanzi}-${word.hskLevel}` },
      create: { id: `seed-${word.hanzi}-${word.hskLevel}`, ...word },
      update: { pinyin: word.pinyin, meaning: word.meaning, examples: word.examples },
    })
  }
  console.log(`✅ Seeded ${hsk1Words.length + hsk2Words.length + hsk3Words.length} vocabulary words`)

  for (const lesson of grammarLessons) {
    await prisma.grammarLesson.upsert({
      where: { id: lesson.id },
      create: lesson,
      update: { content: lesson.content, exercises: lesson.exercises, titleVi: lesson.titleVi },
    })
  }
  console.log(`✅ Seeded ${grammarLessons.length} grammar lessons`)

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
