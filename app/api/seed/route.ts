import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Only allow in development
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    // Seed HSK 1 vocabulary
    const hsk1Words = [
      { hanzi: '我', pinyin: 'wǒ', meaning: 'tôi, tao', hskLevel: 1, examples: [{ sentence: '我是学生。', pinyin: 'Wǒ shì xuésheng.', meaning: 'Tôi là học sinh.' }], tags: ['đại từ'] },
      { hanzi: '你', pinyin: 'nǐ', meaning: 'bạn, mày', hskLevel: 1, examples: [{ sentence: '你好！', pinyin: 'Nǐ hǎo!', meaning: 'Xin chào!' }], tags: ['đại từ'] },
      { hanzi: '他', pinyin: 'tā', meaning: 'anh ấy, nó (nam)', hskLevel: 1, examples: [{ sentence: '他是老师。', pinyin: 'Tā shì lǎoshī.', meaning: 'Anh ấy là giáo viên.' }], tags: ['đại từ'] },
      { hanzi: '她', pinyin: 'tā', meaning: 'cô ấy (nữ)', hskLevel: 1, examples: [{ sentence: '她很漂亮。', pinyin: 'Tā hěn piàoliang.', meaning: 'Cô ấy rất đẹp.' }], tags: ['đại từ'] },
      { hanzi: '好', pinyin: 'hǎo', meaning: 'tốt, được, hay', hskLevel: 1, examples: [{ sentence: '你好！', pinyin: 'Nǐ hǎo!', meaning: 'Xin chào!' }], tags: ['tính từ'] },
      { hanzi: '是', pinyin: 'shì', meaning: 'là (động từ)', hskLevel: 1, examples: [{ sentence: '这是书。', pinyin: 'Zhè shì shū.', meaning: 'Đây là sách.' }], tags: ['động từ'] },
      { hanzi: '不', pinyin: 'bù', meaning: 'không', hskLevel: 1, examples: [{ sentence: '我不去。', pinyin: 'Wǒ bù qù.', meaning: 'Tôi không đi.' }], tags: ['phó từ'] },
      { hanzi: '的', pinyin: 'de', meaning: 'của (trợ từ)', hskLevel: 1, examples: [{ sentence: '我的书', pinyin: 'Wǒ de shū', meaning: 'Sách của tôi' }], tags: ['trợ từ'] },
      { hanzi: '在', pinyin: 'zài', meaning: 'ở, đang (ở)', hskLevel: 1, examples: [{ sentence: '我在家。', pinyin: 'Wǒ zài jiā.', meaning: 'Tôi ở nhà.' }], tags: ['động từ', 'giới từ'] },
      { hanzi: '有', pinyin: 'yǒu', meaning: 'có', hskLevel: 1, examples: [{ sentence: '我有一本书。', pinyin: 'Wǒ yǒu yī běn shū.', meaning: 'Tôi có một quyển sách.' }], tags: ['động từ'] },
      { hanzi: '人', pinyin: 'rén', meaning: 'người', hskLevel: 1, examples: [{ sentence: '他是好人。', pinyin: 'Tā shì hǎo rén.', meaning: 'Anh ấy là người tốt.' }], tags: ['danh từ'] },
      { hanzi: '大', pinyin: 'dà', meaning: 'lớn, to', hskLevel: 1, examples: [{ sentence: '这是大学。', pinyin: 'Zhè shì dàxué.', meaning: 'Đây là trường đại học.' }], tags: ['tính từ'] },
      { hanzi: '小', pinyin: 'xiǎo', meaning: 'nhỏ, bé', hskLevel: 1, examples: [{ sentence: '小猫很可爱。', pinyin: 'Xiǎo māo hěn kě\'ài.', meaning: 'Con mèo nhỏ rất đáng yêu.' }], tags: ['tính từ'] },
      { hanzi: '来', pinyin: 'lái', meaning: 'đến, tới', hskLevel: 1, examples: [{ sentence: '请进来。', pinyin: 'Qǐng jìn lái.', meaning: 'Mời vào.' }], tags: ['động từ'] },
      { hanzi: '去', pinyin: 'qù', meaning: 'đi, đến (nơi xa)', hskLevel: 1, examples: [{ sentence: '我去学校。', pinyin: 'Wǒ qù xuéxiào.', meaning: 'Tôi đi đến trường.' }], tags: ['động từ'] },
      { hanzi: '吃', pinyin: 'chī', meaning: 'ăn', hskLevel: 1, examples: [{ sentence: '我想吃面条。', pinyin: 'Wǒ xiǎng chī miàntiáo.', meaning: 'Tôi muốn ăn mì.' }], tags: ['động từ'] },
      { hanzi: '喝', pinyin: 'hē', meaning: 'uống', hskLevel: 1, examples: [{ sentence: '你喝水吗？', pinyin: 'Nǐ hē shuǐ ma?', meaning: 'Bạn uống nước không?' }], tags: ['động từ'] },
      { hanzi: '学', pinyin: 'xué', meaning: 'học', hskLevel: 1, examples: [{ sentence: '我学汉语。', pinyin: 'Wǒ xué Hànyǔ.', meaning: 'Tôi học tiếng Trung.' }], tags: ['động từ'] },
      { hanzi: '说', pinyin: 'shuō', meaning: 'nói', hskLevel: 1, examples: [{ sentence: '他说汉语。', pinyin: 'Tā shuō Hànyǔ.', meaning: 'Anh ấy nói tiếng Trung.' }], tags: ['động từ'] },
      { hanzi: '看', pinyin: 'kàn', meaning: 'xem, nhìn', hskLevel: 1, examples: [{ sentence: '我看书。', pinyin: 'Wǒ kàn shū.', meaning: 'Tôi đọc sách.' }], tags: ['động từ'] },
      { hanzi: '爱', pinyin: 'ài', meaning: 'yêu', hskLevel: 1, examples: [{ sentence: '我爱你。', pinyin: 'Wǒ ài nǐ.', meaning: 'Tôi yêu bạn.' }], tags: ['động từ'] },
      { hanzi: '朋友', pinyin: 'péngyǒu', meaning: 'bạn bè', hskLevel: 1, examples: [{ sentence: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyǒu.', meaning: 'Anh ấy là bạn của tôi.' }], tags: ['danh từ'] },
      { hanzi: '学生', pinyin: 'xuésheng', meaning: 'học sinh, sinh viên', hskLevel: 1, examples: [{ sentence: '我是学生。', pinyin: 'Wǒ shì xuésheng.', meaning: 'Tôi là học sinh.' }], tags: ['danh từ'] },
      { hanzi: '老师', pinyin: 'lǎoshī', meaning: 'giáo viên, thầy/cô', hskLevel: 1, examples: [{ sentence: '她是老师。', pinyin: 'Tā shì lǎoshī.', meaning: 'Cô ấy là giáo viên.' }], tags: ['danh từ'] },
      { hanzi: '妈妈', pinyin: 'māma', meaning: 'mẹ', hskLevel: 1, examples: [{ sentence: '妈妈做饭。', pinyin: 'Māma zuò fàn.', meaning: 'Mẹ nấu cơm.' }], tags: ['danh từ', 'gia đình'] },
      { hanzi: '爸爸', pinyin: 'bàba', meaning: 'bố, ba', hskLevel: 1, examples: [{ sentence: '爸爸很忙。', pinyin: 'Bàba hěn máng.', meaning: 'Bố rất bận.' }], tags: ['danh từ', 'gia đình'] },
      { hanzi: '中国', pinyin: 'Zhōngguó', meaning: 'Trung Quốc', hskLevel: 1, examples: [{ sentence: '我来自中国。', pinyin: 'Wǒ láizì Zhōngguó.', meaning: 'Tôi đến từ Trung Quốc.' }], tags: ['danh từ', 'quốc gia'] },
      { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: 'tiếng Trung (Hán ngữ)', hskLevel: 1, examples: [{ sentence: '我学汉语。', pinyin: 'Wǒ xué Hànyǔ.', meaning: 'Tôi học tiếng Trung.' }], tags: ['danh từ', 'ngôn ngữ'] },
      { hanzi: '今天', pinyin: 'jīntiān', meaning: 'hôm nay', hskLevel: 1, examples: [{ sentence: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', meaning: 'Hôm nay thời tiết rất đẹp.' }], tags: ['danh từ', 'thời gian'] },
      { hanzi: '水', pinyin: 'shuǐ', meaning: 'nước', hskLevel: 1, examples: [{ sentence: '我喝水。', pinyin: 'Wǒ hē shuǐ.', meaning: 'Tôi uống nước.' }], tags: ['danh từ'] },
    ]

    // Seed HSK 2 vocabulary
    const hsk2Words = [
      { hanzi: '高兴', pinyin: 'gāoxìng', meaning: 'vui, vui mừng', hskLevel: 2, examples: [{ sentence: '我很高兴认识你。', pinyin: 'Wǒ hěn gāoxìng rènshi nǐ.', meaning: 'Tôi rất vui được gặp bạn.' }], tags: ['tính từ', 'cảm xúc'] },
      { hanzi: '知道', pinyin: 'zhīdào', meaning: 'biết', hskLevel: 2, examples: [{ sentence: '我不知道。', pinyin: 'Wǒ bù zhīdào.', meaning: 'Tôi không biết.' }], tags: ['động từ'] },
      { hanzi: '喜欢', pinyin: 'xǐhuān', meaning: 'thích', hskLevel: 2, examples: [{ sentence: '我喜欢音乐。', pinyin: 'Wǒ xǐhuān yīnyuè.', meaning: 'Tôi thích âm nhạc.' }], tags: ['động từ'] },
      { hanzi: '觉得', pinyin: 'juéde', meaning: 'cảm thấy, cho rằng', hskLevel: 2, examples: [{ sentence: '我觉得很好。', pinyin: 'Wǒ juéde hěn hǎo.', meaning: 'Tôi cảm thấy rất tốt.' }], tags: ['động từ'] },
      { hanzi: '问题', pinyin: 'wèntí', meaning: 'câu hỏi, vấn đề', hskLevel: 2, examples: [{ sentence: '有问题吗？', pinyin: 'Yǒu wèntí ma?', meaning: 'Có câu hỏi không?' }], tags: ['danh từ'] },
      { hanzi: '工作', pinyin: 'gōngzuò', meaning: 'làm việc, công việc', hskLevel: 2, examples: [{ sentence: '他在工作。', pinyin: 'Tā zài gōngzuò.', meaning: 'Anh ấy đang làm việc.' }], tags: ['động từ', 'danh từ'] },
      { hanzi: '时候', pinyin: 'shíhou', meaning: 'lúc, khi', hskLevel: 2, examples: [{ sentence: '你什么时候来？', pinyin: 'Nǐ shénme shíhou lái?', meaning: 'Khi nào bạn đến?' }], tags: ['danh từ', 'thời gian'] },
      { hanzi: '一起', pinyin: 'yīqǐ', meaning: 'cùng nhau', hskLevel: 2, examples: [{ sentence: '我们一起去吧。', pinyin: 'Wǒmen yīqǐ qù ba.', meaning: 'Chúng ta cùng đi nhé.' }], tags: ['phó từ'] },
      { hanzi: '已经', pinyin: 'yǐjīng', meaning: 'đã (rồi)', hskLevel: 2, examples: [{ sentence: '我已经吃了。', pinyin: 'Wǒ yǐjīng chī le.', meaning: 'Tôi đã ăn rồi.' }], tags: ['phó từ'] },
      { hanzi: '还是', pinyin: 'háishì', meaning: 'hay là, vẫn là', hskLevel: 2, examples: [{ sentence: '喝茶还是喝咖啡？', pinyin: 'Hē chá háishì hē kāfēi?', meaning: 'Uống trà hay cà phê?' }], tags: ['liên từ'] },
    ]

    // Seed HSK 3 vocabulary
    const hsk3Words = [
      { hanzi: '其实', pinyin: 'qíshí', meaning: 'thực ra, thực tế', hskLevel: 3, examples: [{ sentence: '其实我不太喜欢。', pinyin: 'Qíshí wǒ bù tài xǐhuān.', meaning: 'Thực ra tôi không thích lắm.' }], tags: ['phó từ'] },
      { hanzi: '终于', pinyin: 'zhōngyú', meaning: 'cuối cùng', hskLevel: 3, examples: [{ sentence: '我终于明白了。', pinyin: 'Wǒ zhōngyú míngbái le.', meaning: 'Cuối cùng tôi đã hiểu rồi.' }], tags: ['phó từ'] },
      { hanzi: '简单', pinyin: 'jiǎndān', meaning: 'đơn giản', hskLevel: 3, examples: [{ sentence: '这很简单。', pinyin: 'Zhè hěn jiǎndān.', meaning: 'Điều này rất đơn giản.' }], tags: ['tính từ'] },
      { hanzi: '复杂', pinyin: 'fùzá', meaning: 'phức tạp', hskLevel: 3, examples: [{ sentence: '这个问题很复杂。', pinyin: 'Zhège wèntí hěn fùzá.', meaning: 'Vấn đề này rất phức tạp.' }], tags: ['tính từ'] },
      { hanzi: '重要', pinyin: 'zhòngyào', meaning: 'quan trọng', hskLevel: 3, examples: [{ sentence: '这很重要。', pinyin: 'Zhè hěn zhòngyào.', meaning: 'Điều này rất quan trọng.' }], tags: ['tính từ'] },
    ]

    // Create vocabulary
    for (const word of [...hsk1Words, ...hsk2Words, ...hsk3Words]) {
      await prisma.vocabulary.upsert({
        where: { id: `seed-${word.hanzi}-${word.hskLevel}` },
        create: { id: `seed-${word.hanzi}-${word.hskLevel}`, ...word },
        update: { pinyin: word.pinyin, meaning: word.meaning, examples: word.examples },
      })
    }

    // Seed grammar lessons
    const grammarLessons = [
      {
        id: 'grammar-hsk1-1',
        title: '是...的 Structure',
        titleVi: 'Cấu trúc 是...的',
        hskLevel: 1,
        order: 1,
        content: [
          { type: 'heading', content: 'Cấu trúc 是 (shì) - Là' },
          { type: 'text', content: 'Động từ "是" (shì) có nghĩa là "là". Dùng để nối chủ ngữ với danh từ hoặc cụm danh từ.' },
          { type: 'pattern', content: '主语 + 是 + 名词', pinyin: 'Zhǔyǔ + shì + míngcí', translation: 'Chủ ngữ + là + danh từ' },
          { type: 'example', content: '我是学生。', pinyin: 'Wǒ shì xuésheng.', translation: 'Tôi là học sinh.' },
          { type: 'example', content: '他是老师。', pinyin: 'Tā shì lǎoshī.', translation: 'Anh ấy là giáo viên.' },
          { type: 'note', content: 'Phủ định: 不是 (bú shì) = không phải là. Ví dụ: 我不是学生。(Tôi không phải là học sinh.)' },
          { type: 'tip', content: 'Mẹo: "是" không thay đổi theo thì. Tiếng Trung không có chia động từ theo thì!' },
        ],
        exercises: [
          { id: 'ex1', type: 'multiple_choice', question: '"Tôi là học sinh" bằng tiếng Trung là gì?', options: ['他是学生。', '我是学生。', '你是老师。', '她是医生。'], answer: '我是学生。', explanation: '我(wǒ) = tôi, 是(shì) = là, 学生(xuésheng) = học sinh' },
          { id: 'ex2', type: 'fill_blank', question: 'Điền vào chỗ trống: 他___老师。(Anh ấy là giáo viên)', answer: '是', explanation: '是(shì) = là' },
          { id: 'ex3', type: 'multiple_choice', question: '"Cô ấy không phải là học sinh" là?', options: ['她是学生。', '她不是学生。', '她是老师。', '她不学习。'], answer: '她不是学生。', explanation: '不是 = không phải là' },
        ],
      },
      {
        id: 'grammar-hsk1-2',
        title: '有 yǒu - Have/There is',
        titleVi: 'Động từ 有 (yǒu) - Có',
        hskLevel: 1,
        order: 2,
        content: [
          { type: 'heading', content: 'Động từ 有 (yǒu) - Có' },
          { type: 'text', content: '有 có hai nghĩa chính: (1) sở hữu "có", (2) tồn tại "có, tồn tại".' },
          { type: 'pattern', content: '主语 + 有 + 宾语', pinyin: 'Zhǔyǔ + yǒu + bīnyǔ', translation: 'Chủ ngữ + có + tân ngữ' },
          { type: 'example', content: '我有一本书。', pinyin: 'Wǒ yǒu yī běn shū.', translation: 'Tôi có một quyển sách.' },
          { type: 'example', content: '这里有人吗？', pinyin: 'Zhèlǐ yǒu rén ma?', translation: 'Ở đây có người không?' },
          { type: 'note', content: 'Phủ định của 有 là 没有 (méiyǒu) = không có. KHÔNG dùng 不有!' },
          { type: 'tip', content: 'Nhớ: 没有 (méiyǒu) = không có (phủ định duy nhất của 有)' },
        ],
        exercises: [
          { id: 'ex1', type: 'multiple_choice', question: '"Tôi không có tiền" bằng tiếng Trung?', options: ['我有钱。', '我不有钱。', '我没有钱。', '我没钱有。'], answer: '我没有钱。', explanation: '没有 là phủ định của 有, không dùng 不有' },
          { id: 'ex2', type: 'fill_blank', question: 'Điền vào: 我___一个哥哥。(Tôi có một anh trai)', answer: '有', explanation: 'Dùng 有 để diễn đạt sở hữu' },
        ],
      },
      {
        id: 'grammar-hsk2-1',
        title: '比 bǐ - Comparison',
        titleVi: 'So sánh với 比 (bǐ)',
        hskLevel: 2,
        order: 1,
        content: [
          { type: 'heading', content: 'So sánh hơn với 比 (bǐ)' },
          { type: 'text', content: '比 (bǐ) dùng để so sánh hơn kém giữa hai đối tượng.' },
          { type: 'pattern', content: 'A + 比 + B + 形容词', pinyin: 'A + bǐ + B + xíngróngcí', translation: 'A so sánh với B + tính từ (A hơn/kém B)' },
          { type: 'example', content: '他比我高。', pinyin: 'Tā bǐ wǒ gāo.', translation: 'Anh ấy cao hơn tôi.' },
          { type: 'example', content: '汉语比英语难。', pinyin: 'Hànyǔ bǐ Yīngyǔ nán.', translation: 'Tiếng Trung khó hơn tiếng Anh.' },
          { type: 'note', content: 'Phủ định: 没有 (méiyǒu). Ví dụ: 我没有他高。= Tôi không cao bằng anh ấy.' },
        ],
        exercises: [
          { id: 'ex1', type: 'multiple_choice', question: '"Hôm nay nóng hơn hôm qua" là?', options: ['今天比昨天热。', '今天热比昨天。', '今天和昨天热。', '昨天比今天热。'], answer: '今天比昨天热。', explanation: 'Cấu trúc: A + 比 + B + tính từ' },
          { id: 'ex2', type: 'fill_blank', question: 'Điền: 苹果___橙子贵。(Táo đắt hơn cam)', answer: '比', explanation: 'Dùng 比 để so sánh hơn' },
        ],
      },
    ]

    for (const lesson of grammarLessons) {
      await prisma.grammarLesson.upsert({
        where: { id: lesson.id },
        create: lesson,
        update: { content: lesson.content, exercises: lesson.exercises },
      })
    }

    return NextResponse.json({
      data: {
        vocabularySeeded: hsk1Words.length + hsk2Words.length + hsk3Words.length,
        grammarLessonsSeeded: grammarLessons.length,
      },
      error: null,
    })
  } catch (e) {
    console.error('Seed error:', e)
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}
