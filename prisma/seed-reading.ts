import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const passages = [
  {
    id: 'reading-hsk3-city-life',
    title: '城市生活的变化',
    titleVi: 'Sự thay đổi của cuộc sống thành phố',
    hskLevel: 3,
    difficulty: 'medium',
    tags: ['xã hội', 'cuộc sống', 'thành phố'],
    wordCount: 180,
    content: `近年来，中国的城市发展得非常快。二十年前，很多城市的街道还很窄，房子也不太高。但是现在，到处都是高楼大厦和宽阔的马路。

人们的生活方式也发生了很大的变化。以前，大家习惯去商店买东西，现在越来越多的人喜欢在网上购物。以前，人们经常写信给朋友，现在用手机发微信就可以了。

虽然城市变得更现代了，但也带来了一些问题。比如交通越来越拥挤，空气质量不太好，房价也越来越贵。很多年轻人觉得在大城市生活压力很大。

不过，城市生活也有很多好处。这里有更多的工作机会，更好的医院和学校，还有丰富的文化活动。所以，每年都有很多人从农村搬到城市来生活。

我觉得，不管是城市还是农村，最重要的是找到适合自己的生活方式。`,
    pinyin: `Jìn nián lái, Zhōngguó de chéngshì fāzhǎn de fēicháng kuài. Èrshí nián qián, hěn duō chéngshì de jiēdào hái hěn zhǎi, fángzi yě bù tài gāo. Dànshì xiànzài, dàochù dōu shì gāolóu dàshà hé kuānkuò de mǎlù.

Rénmen de shēnghuó fāngshì yě fāshēng le hěn dà de biànhuà. Yǐqián, dàjiā xíguàn qù shāngdiàn mǎi dōngxi, xiànzài yuè lái yuè duō de rén xǐhuān zài wǎng shàng gòuwù. Yǐqián, rénmen jīngcháng xiě xìn gěi péngyǒu, xiànzài yòng shǒujī fā wēixìn jiù kěyǐ le.

Suīrán chéngshì biàn de gèng xiàndài le, dàn yě dài lái le yīxiē wèntí. Bǐrú jiāotōng yuè lái yuè yōngjǐ, kōngqì zhìliàng bù tài hǎo, fángjià yě yuè lái yuè guì. Hěn duō niánqīng rén juéde zài dà chéngshì shēnghuó yālì hěn dà.

Búguò, chéngshì shēnghuó yě yǒu hěn duō hǎochù. Zhèlǐ yǒu gèng duō de gōngzuò jīhuì, gèng hǎo de yīyuàn hé xuéxiào, hái yǒu fēngfù de wénhuà huódòng. Suǒyǐ, měi nián dōu yǒu hěn duō rén cóng nóngcūn bān dào chéngshì lái shēnghuó.

Wǒ juéde, bùguǎn shì chéngshì háishì nóngcūn, zuì zhòngyào de shì zhǎo dào shìhé zìjǐ de shēnghuó fāngshì.`,
    translation: `Những năm gần đây, các thành phố Trung Quốc phát triển rất nhanh. Hai mươi năm trước, đường phố nhiều thành phố còn rất hẹp, nhà cửa cũng không cao lắm. Nhưng bây giờ, khắp nơi đều là nhà cao tầng và đường lớn rộng rãi.

Lối sống của mọi người cũng thay đổi rất nhiều. Trước đây, mọi người quen đi cửa hàng mua đồ, bây giờ ngày càng nhiều người thích mua sắm trực tuyến. Trước đây, mọi người thường viết thư cho bạn bè, bây giờ dùng điện thoại nhắn WeChat là được rồi.

Mặc dù thành phố trở nên hiện đại hơn, nhưng cũng mang đến một số vấn đề. Ví dụ giao thông ngày càng tắc nghẽn, chất lượng không khí không tốt lắm, giá nhà cũng ngày càng đắt. Nhiều bạn trẻ cảm thấy áp lực sống ở thành phố lớn rất lớn.

Tuy nhiên, cuộc sống thành phố cũng có nhiều lợi ích. Ở đây có nhiều cơ hội việc làm hơn, bệnh viện và trường học tốt hơn, còn có nhiều hoạt động văn hóa phong phú. Vì vậy, mỗi năm đều có rất nhiều người từ nông thôn chuyển đến thành phố sinh sống.

Tôi nghĩ, dù là thành phố hay nông thôn, điều quan trọng nhất là tìm được lối sống phù hợp với mình.`,
    vocabulary: [
      { hanzi: '发展', pinyin: 'fāzhǎn', meaning: 'phát triển' },
      { hanzi: '街道', pinyin: 'jiēdào', meaning: 'đường phố' },
      { hanzi: '高楼大厦', pinyin: 'gāolóu dàshà', meaning: 'nhà cao tầng' },
      { hanzi: '生活方式', pinyin: 'shēnghuó fāngshì', meaning: 'lối sống' },
      { hanzi: '变化', pinyin: 'biànhuà', meaning: 'thay đổi' },
      { hanzi: '购物', pinyin: 'gòuwù', meaning: 'mua sắm' },
      { hanzi: '交通', pinyin: 'jiāotōng', meaning: 'giao thông' },
      { hanzi: '拥挤', pinyin: 'yōngjǐ', meaning: 'tắc nghẽn, đông đúc' },
      { hanzi: '空气质量', pinyin: 'kōngqì zhìliàng', meaning: 'chất lượng không khí' },
      { hanzi: '压力', pinyin: 'yālì', meaning: 'áp lực' },
      { hanzi: '机会', pinyin: 'jīhuì', meaning: 'cơ hội' },
      { hanzi: '丰富', pinyin: 'fēngfù', meaning: 'phong phú' },
      { hanzi: '农村', pinyin: 'nóngcūn', meaning: 'nông thôn' },
      { hanzi: '适合', pinyin: 'shìhé', meaning: 'phù hợp' },
    ],
    questions: [
      { question: 'Hai mươi năm trước, thành phố Trung Quốc như thế nào?', options: ['Đường phố hẹp, nhà không cao', 'Đã có nhiều nhà cao tầng', 'Giao thông rất tắc', 'Có nhiều cửa hàng trực tuyến'], answer: 'Đường phố hẹp, nhà không cao', explanation: 'Bài viết nói: "二十年前，很多城市的街道还很窄，房子也不太高"' },
      { question: 'Sự thay đổi nào được nhắc đến về cách mua sắm?', options: ['Mọi người không mua sắm nữa', 'Mọi người chuyển sang mua sắm trực tuyến', 'Cửa hàng biến mất hoàn toàn', 'Giá cả rẻ hơn'], answer: 'Mọi người chuyển sang mua sắm trực tuyến', explanation: '越来越多的人喜欢在网上购物 = ngày càng nhiều người thích mua sắm trực tuyến' },
      { question: 'Vấn đề nào KHÔNG được nhắc đến khi nói về thành phố?', options: ['Giao thông tắc nghẽn', 'Không khí không tốt', 'Thiếu nước sạch', 'Giá nhà đắt'], answer: 'Thiếu nước sạch', explanation: 'Bài chỉ nhắc: giao thông tắc, không khí kém, giá nhà đắt. Không nhắc thiếu nước.' },
      { question: 'Tại sao nhiều người từ nông thôn chuyển đến thành phố?', options: ['Vì nông thôn không có nhà', 'Vì thành phố có nhiều cơ hội việc làm, trường học, bệnh viện tốt hơn', 'Vì chính phủ bắt buộc', 'Vì thời tiết tốt hơn'], answer: 'Vì thành phố có nhiều cơ hội việc làm, trường học, bệnh viện tốt hơn', explanation: '这里有更多的工作机会，更好的医院和学校' },
      { question: 'Theo tác giả, điều quan trọng nhất là gì?', options: ['Sống ở thành phố lớn', 'Kiếm thật nhiều tiền', 'Tìm lối sống phù hợp với mình', 'Quay về nông thôn'], answer: 'Tìm lối sống phù hợp với mình', explanation: '最重要的是找到适合自己的生活方式 = điều quan trọng nhất là tìm lối sống phù hợp' },
    ],
  },
  {
    id: 'reading-hsk4-education',
    title: '中国教育的发展与挑战',
    titleVi: 'Sự phát triển và thách thức của giáo dục Trung Quốc',
    hskLevel: 4,
    difficulty: 'hard',
    tags: ['giáo dục', 'xã hội', 'phân tích'],
    wordCount: 250,
    content: `中国的教育体系在过去几十年里发生了巨大的变化。从1977年恢复高考以来，越来越多的中国人有机会接受高等教育。根据最新的数据，中国每年有超过一千万学生参加高考，大学录取率也在不断提高。

然而，中国的教育也面临着许多挑战。首先，教育资源分配不均衡。大城市的学校通常有更好的设施和师资力量，而农村地区的教育条件相对较差。这导致了城乡之间教育质量的差距越来越大。

其次，应试教育的问题一直受到社会的关注。很多学生从小学开始就承受着巨大的学习压力，每天要做大量的作业，参加各种课外辅导班。这种教育方式虽然能帮助学生在考试中取得好成绩，但可能不利于培养学生的创造力和独立思考能力。

近年来，中国政府推出了"双减"政策，试图减轻学生的课业负担。这项政策限制了校外培训机构的运营时间，也减少了学生的作业量。虽然这一政策的初衷是好的，但在实施过程中也遇到了不少困难。

教育改革是一个长期的过程，需要政府、学校、家长和社会各方面的共同努力。我们希望未来的教育能够更加注重培养学生的综合素质，让每个孩子都能找到适合自己的成长道路。`,
    pinyin: `Zhōngguó de jiàoyù tǐxì zài guòqù jǐ shí nián lǐ fāshēng le jùdà de biànhuà. Cóng 1977 nián huīfù gāokǎo yǐlái, yuè lái yuè duō de Zhōngguó rén yǒu jīhuì jiēshòu gāoděng jiàoyù. Gēnjù zuìxīn de shùjù, Zhōngguó měi nián yǒu chāoguò yī qiān wàn xuéshēng cānjiā gāokǎo, dàxué lùqǔ lǜ yě zài búduàn tígāo.

Rán'ér, Zhōngguó de jiàoyù yě miànlín zhe xǔduō tiǎozhàn. Shǒuxiān, jiàoyù zīyuán fēnpèi bù jūnhéng. Dà chéngshì de xuéxiào tōngcháng yǒu gèng hǎo de shèshī hé shīzī lìliàng, ér nóngcūn dìqū de jiàoyù tiáojiàn xiāngduì jiào chā. Zhè dǎozhì le chéng xiāng zhī jiān jiàoyù zhìliàng de chājù yuè lái yuè dà.

Qícì, yìngshì jiàoyù de wèntí yīzhí shòudào shèhuì de guānzhù. Hěn duō xuéshēng cóng xiǎoxué kāishǐ jiù chéngshòu zhe jùdà de xuéxí yālì, měi tiān yào zuò dàliàng de zuòyè, cānjiā gè zhǒng kèwài fǔdǎo bān. Zhè zhǒng jiàoyù fāngshì suīrán néng bāngzhù xuéshēng zài kǎoshì zhōng qǔdé hǎo chéngjì, dàn kěnéng bù lì yú péiyǎng xuéshēng de chuàngzào lì hé dúlì sīkǎo nénglì.

Jìn nián lái, Zhōngguó zhèngfǔ tuīchū le "shuāng jiǎn" zhèngcè, shìtú jiǎnqīng xuéshēng de kèyè fùdān. Zhè xiàng zhèngcè xiànzhì le xiào wài péixùn jīgòu de yùnyíng shíjiān, yě jiǎnshǎo le xuéshēng de zuòyè liàng. Suīrán zhè yī zhèngcè de chūzhōng shì hǎo de, dàn zài shíshī guòchéng zhōng yě yù dào le bù shǎo kùnnán.

Jiàoyù gǎigé shì yī gè chángqī de guòchéng, xūyào zhèngfǔ, xuéxiào, jiāzhǎng hé shèhuì gè fāngmiàn de gòngtóng nǔlì. Wǒmen xīwàng wèilái de jiàoyù nénggòu gèng jiā zhùzhòng péiyǎng xuéshēng de zōnghé sùzhì, ràng měi gè háizi dōu néng zhǎo dào shìhé zìjǐ de chéngzhǎng dàolù.`,
    translation: `Hệ thống giáo dục Trung Quốc đã trải qua những thay đổi to lớn trong vài thập kỷ qua. Kể từ khi khôi phục kỳ thi đại học (cao khảo) năm 1977, ngày càng nhiều người Trung Quốc có cơ hội tiếp nhận giáo dục đại học. Theo số liệu mới nhất, mỗi năm Trung Quốc có hơn mười triệu học sinh tham gia thi đại học, tỷ lệ trúng tuyển cũng không ngừng tăng lên.

Tuy nhiên, giáo dục Trung Quốc cũng đối mặt với nhiều thách thức. Trước hết, phân bổ nguồn lực giáo dục không đồng đều. Trường học ở thành phố lớn thường có cơ sở vật chất và đội ngũ giáo viên tốt hơn, trong khi điều kiện giáo dục ở nông thôn tương đối kém. Điều này dẫn đến khoảng cách chất lượng giáo dục giữa thành thị và nông thôn ngày càng lớn.

Thứ hai, vấn đề giáo dục ứng thí (học để thi) luôn được xã hội quan tâm. Nhiều học sinh từ tiểu học đã phải chịu áp lực học tập rất lớn, mỗi ngày phải làm rất nhiều bài tập, tham gia các lớp phụ đạo ngoài giờ. Phương pháp giáo dục này tuy có thể giúp học sinh đạt điểm cao trong kỳ thi, nhưng có thể không có lợi cho việc bồi dưỡng khả năng sáng tạo và tư duy độc lập của học sinh.

Những năm gần đây, Chính phủ Trung Quốc đã ban hành chính sách "giảm kép" (双减), cố gắng giảm bớt gánh nặng học tập cho học sinh. Chính sách này hạn chế thời gian hoạt động của các cơ sở đào tạo ngoài trường, cũng giảm lượng bài tập của học sinh. Mặc dù mục đích ban đầu của chính sách này là tốt, nhưng trong quá trình thực hiện cũng gặp không ít khó khăn.

Cải cách giáo dục là một quá trình lâu dài, cần sự nỗ lực chung của chính phủ, trường học, phụ huynh và toàn xã hội. Chúng ta hy vọng giáo dục trong tương lai sẽ chú trọng hơn vào việc bồi dưỡng chất lượng toàn diện của học sinh, để mỗi em đều tìm được con đường phát triển phù hợp với mình.`,
    vocabulary: [
      { hanzi: '教育体系', pinyin: 'jiàoyù tǐxì', meaning: 'hệ thống giáo dục' },
      { hanzi: '恢复', pinyin: 'huīfù', meaning: 'khôi phục' },
      { hanzi: '高考', pinyin: 'gāokǎo', meaning: 'kỳ thi đại học (cao khảo)' },
      { hanzi: '高等教育', pinyin: 'gāoděng jiàoyù', meaning: 'giáo dục đại học' },
      { hanzi: '录取率', pinyin: 'lùqǔ lǜ', meaning: 'tỷ lệ trúng tuyển' },
      { hanzi: '挑战', pinyin: 'tiǎozhàn', meaning: 'thách thức' },
      { hanzi: '资源分配', pinyin: 'zīyuán fēnpèi', meaning: 'phân bổ nguồn lực' },
      { hanzi: '均衡', pinyin: 'jūnhéng', meaning: 'cân bằng, đồng đều' },
      { hanzi: '师资力量', pinyin: 'shīzī lìliàng', meaning: 'đội ngũ giáo viên' },
      { hanzi: '应试教育', pinyin: 'yìngshì jiàoyù', meaning: 'giáo dục ứng thí' },
      { hanzi: '课外辅导', pinyin: 'kèwài fǔdǎo', meaning: 'phụ đạo ngoài giờ' },
      { hanzi: '创造力', pinyin: 'chuàngzào lì', meaning: 'khả năng sáng tạo' },
      { hanzi: '独立思考', pinyin: 'dúlì sīkǎo', meaning: 'tư duy độc lập' },
      { hanzi: '双减', pinyin: 'shuāng jiǎn', meaning: 'giảm kép (chính sách)' },
      { hanzi: '课业负担', pinyin: 'kèyè fùdān', meaning: 'gánh nặng học tập' },
      { hanzi: '综合素质', pinyin: 'zōnghé sùzhì', meaning: 'chất lượng toàn diện' },
    ],
    questions: [
      { question: 'Kỳ thi đại học (高考) được khôi phục vào năm nào?', options: ['1966', '1977', '1985', '2000'], answer: '1977', explanation: '从1977年恢复高考以来 = Kể từ khi khôi phục cao khảo năm 1977' },
      { question: 'Mỗi năm có khoảng bao nhiêu học sinh tham gia cao khảo?', options: ['1 triệu', '5 triệu', 'Hơn 10 triệu', '100 triệu'], answer: 'Hơn 10 triệu', explanation: '超过一千万学生参加高考 = hơn 10 triệu học sinh tham gia' },
      { question: 'Nguyên nhân chính gây ra khoảng cách giáo dục thành thị - nông thôn?', options: ['Nông thôn không có trường học', 'Phân bổ nguồn lực không đồng đều', 'Học sinh nông thôn không muốn học', 'Giáo viên không muốn về nông thôn'], answer: 'Phân bổ nguồn lực không đồng đều', explanation: '教育资源分配不均衡 dẫn đến khoảng cách thành thị-nông thôn' },
      { question: 'Giáo dục ứng thí (应试教育) có nhược điểm gì?', options: ['Không giúp đỗ đại học', 'Tốn nhiều tiền', 'Không lợi cho sáng tạo và tư duy độc lập', 'Quá dễ dàng'], answer: 'Không lợi cho sáng tạo và tư duy độc lập', explanation: '可能不利于培养学生的创造力和独立思考能力' },
      { question: 'Chính sách "双减" nhằm mục đích gì?', options: ['Tăng lương giáo viên', 'Giảm gánh nặng học tập cho học sinh', 'Xây thêm trường học', 'Tăng số lượng kỳ thi'], answer: 'Giảm gánh nặng học tập cho học sinh', explanation: '试图减轻学生的课业负担 = cố gắng giảm gánh nặng học tập' },
      { question: 'Theo tác giả, cải cách giáo dục cần gì?', options: ['Chỉ cần chính phủ', 'Chỉ cần giáo viên giỏi', 'Sự nỗ lực chung của chính phủ, trường, phụ huynh và xã hội', 'Bỏ hoàn toàn kỳ thi'], answer: 'Sự nỗ lực chung của chính phủ, trường, phụ huynh và xã hội', explanation: '需要政府、学校、家长和社会各方面的共同努力' },
    ],
  },
  {
    id: 'reading-hsk5-ai-technology',
    title: '人工智能时代的机遇与反思',
    titleVi: 'Cơ hội và suy ngẫm trong thời đại trí tuệ nhân tạo',
    hskLevel: 5,
    difficulty: 'hard',
    tags: ['công nghệ', 'AI', 'triết học', 'tương lai'],
    wordCount: 350,
    content: `人工智能技术的飞速发展正在深刻改变着我们的社会。从智能手机上的语音助手到自动驾驶汽车，从医疗诊断到金融分析，人工智能已经渗透到了我们生活的方方面面。

在教育领域，人工智能的应用尤为引人注目。智能辅导系统可以根据每个学生的学习进度和薄弱环节，提供个性化的教学方案。自然语言处理技术使得语言学习变得更加高效，学习者可以随时随地与AI对话练习。这些技术的出现，使得教育不再受限于时间和空间，为全球范围内的教育公平提供了新的可能性。

然而，人工智能的发展也引发了深层次的社会思考。首先是就业问题。据预测，在未来十到二十年内，许多重复性的工作岗位将被自动化取代。这意味着大量劳动者可能面临失业的风险，社会需要为此做好充分的准备，包括建立完善的社会保障体系和职业再培训机制。

其次是伦理问题。当AI系统做出涉及人类生命和权益的决策时，谁应该承担责任？比如，当自动驾驶汽车面临不可避免的事故时，它应该如何选择？这些问题没有简单的答案，需要法律、哲学和技术界的共同探讨。

此外，数据隐私也是一个不可忽视的问题。人工智能的训练需要大量的数据，而这些数据往往涉及个人的隐私信息。如何在推动技术进步的同时保护个人隐私，是我们必须认真面对的课题。

面对人工智能时代的到来，我认为最重要的是保持开放而审慎的态度。我们既要积极拥抱新技术带来的便利和机遇，也要清醒地认识到其潜在的风险和挑战。教育应该培养人们的批判性思维、创造力和同理心——这些是目前AI难以替代的人类核心能力。

正如一位学者所说："技术是一把双刃剑，关键在于握剑的手。"在人工智能时代，我们更需要用智慧和责任来引导技术的发展方向，让它真正服务于人类的福祉。`,
    pinyin: `Réngōng zhìnéng jìshù de fēisù fāzhǎn zhèngzài shēnkè gǎibiàn zhe wǒmen de shèhuì. Cóng zhìnéng shǒujī shàng de yǔyīn zhùshǒu dào zìdòng jiàshǐ qìchē, cóng yīliáo zhěnduàn dào jīnróng fēnxī, réngōng zhìnéng yǐjīng shèntòu dào le wǒmen shēnghuó de fāngfāngmiànmiàn.

Zài jiàoyù lǐngyù, réngōng zhìnéng de yìngyòng yóuwéi yǐn rén zhùmù. Zhìnéng fǔdǎo xìtǒng kěyǐ gēnjù měi gè xuéshēng de xuéxí jìndù hé bóruò huánjié, tígōng gèxìnghuà de jiàoxué fāng'àn. Zìrán yǔyán chǔlǐ jìshù shǐde yǔyán xuéxí biàn de gèng jiā gāoxiào, xuéxí zhě kěyǐ suíshí suídì yǔ AI duìhuà liànxí.

Rán'ér, réngōng zhìnéng de fāzhǎn yě yǐnfā le shēn céngcì de shèhuì sīkǎo. Shǒuxiān shì jiùyè wèntí. Jù yùcè, zài wèilái shí dào èrshí nián nèi, xǔduō chóngfùxìng de gōngzuò gǎngwèi jiāng bèi zìdònghuà qǔdài.

Qícì shì lúnlǐ wèntí. Dāng AI xìtǒng zuòchū shèjí rénlèi shēngmìng hé quányì de juécè shí, shuí yīnggāi chéngdān zérèn?

Cǐwài, shùjù yǐnsī yě shì yī gè bùkě hūshì de wèntí. Réngōng zhìnéng de xùnliàn xūyào dàliàng de shùjù, ér zhèxiē shùjù wǎngwǎng shèjí gèrén de yǐnsī xìnxī.

Miànduì réngōng zhìnéng shídài de dàolái, wǒ rènwéi zuì zhòngyào de shì bǎochí kāifàng ér shěnshèn de tàidù. Jiàoyù yīnggāi péiyǎng rénmen de pīpànxìng sīwéi, chuàngzào lì hé tónglǐ xīn.

Zhèngrú yī wèi xuézhě suǒ shuō: "Jìshù shì yī bǎ shuāng rèn jiàn, guānjiàn zàiyú wò jiàn de shǒu."`,
    translation: `Sự phát triển nhanh chóng của công nghệ trí tuệ nhân tạo đang thay đổi sâu sắc xã hội của chúng ta. Từ trợ lý giọng nói trên điện thoại thông minh đến xe tự lái, từ chẩn đoán y tế đến phân tích tài chính, trí tuệ nhân tạo đã thấm vào mọi mặt của cuộc sống.

Trong lĩnh vực giáo dục, ứng dụng của AI đặc biệt đáng chú ý. Hệ thống gia sư thông minh có thể dựa trên tiến độ học tập và điểm yếu của từng học sinh, cung cấp phương án giảng dạy cá nhân hóa. Công nghệ xử lý ngôn ngữ tự nhiên giúp việc học ngôn ngữ trở nên hiệu quả hơn, người học có thể luyện tập hội thoại với AI mọi lúc mọi nơi.

Tuy nhiên, sự phát triển của AI cũng gây ra những suy ngẫm sâu sắc. Trước hết là vấn đề việc làm. Theo dự đoán, trong 10-20 năm tới, nhiều vị trí công việc mang tính lặp lại sẽ bị tự động hóa thay thế. Điều này có nghĩa là nhiều lao động có thể đối mặt nguy cơ thất nghiệp.

Thứ hai là vấn đề đạo đức. Khi hệ thống AI đưa ra quyết định liên quan đến mạng sống và quyền lợi con người, ai nên chịu trách nhiệm? Ví dụ, khi xe tự lái đối mặt tai nạn không thể tránh, nó nên lựa chọn như thế nào?

Ngoài ra, quyền riêng tư dữ liệu cũng là vấn đề không thể bỏ qua. Việc huấn luyện AI cần lượng lớn dữ liệu, mà những dữ liệu này thường liên quan đến thông tin cá nhân riêng tư.

Đối mặt với thời đại AI, tôi cho rằng điều quan trọng nhất là giữ thái độ cởi mở nhưng thận trọng. Giáo dục nên bồi dưỡng tư duy phản biện, sáng tạo và đồng cảm — những năng lực cốt lõi mà AI khó thay thế.

Như một học giả đã nói: "Công nghệ là thanh gươm hai lưỡi, chìa khóa nằm ở bàn tay cầm gươm." Trong thời đại AI, chúng ta càng cần dùng trí tuệ và trách nhiệm để dẫn dắt hướng phát triển của công nghệ.`,
    vocabulary: [
      { hanzi: '人工智能', pinyin: 'réngōng zhìnéng', meaning: 'trí tuệ nhân tạo (AI)' },
      { hanzi: '飞速', pinyin: 'fēisù', meaning: 'nhanh chóng, tốc độ cao' },
      { hanzi: '渗透', pinyin: 'shèntòu', meaning: 'thấm vào, xâm nhập' },
      { hanzi: '方方面面', pinyin: 'fāngfāngmiànmiàn', meaning: 'mọi mặt, mọi phương diện' },
      { hanzi: '个性化', pinyin: 'gèxìnghuà', meaning: 'cá nhân hóa' },
      { hanzi: '自然语言处理', pinyin: 'zìrán yǔyán chǔlǐ', meaning: 'xử lý ngôn ngữ tự nhiên (NLP)' },
      { hanzi: '就业', pinyin: 'jiùyè', meaning: 'việc làm' },
      { hanzi: '自动化', pinyin: 'zìdònghuà', meaning: 'tự động hóa' },
      { hanzi: '社会保障', pinyin: 'shèhuì bǎozhàng', meaning: 'bảo đảm xã hội' },
      { hanzi: '伦理', pinyin: 'lúnlǐ', meaning: 'đạo đức, luân lý' },
      { hanzi: '数据隐私', pinyin: 'shùjù yǐnsī', meaning: 'quyền riêng tư dữ liệu' },
      { hanzi: '批判性思维', pinyin: 'pīpànxìng sīwéi', meaning: 'tư duy phản biện' },
      { hanzi: '同理心', pinyin: 'tónglǐ xīn', meaning: 'sự đồng cảm' },
      { hanzi: '双刃剑', pinyin: 'shuāng rèn jiàn', meaning: 'gươm hai lưỡi' },
      { hanzi: '福祉', pinyin: 'fúzhǐ', meaning: 'hạnh phúc, phúc lợi' },
      { hanzi: '审慎', pinyin: 'shěnshèn', meaning: 'thận trọng, cẩn thận' },
    ],
    questions: [
      { question: 'AI đã được ứng dụng trong những lĩnh vực nào?', options: ['Chỉ công nghệ', 'Y tế, tài chính, giáo dục, giao thông...', 'Chỉ giáo dục', 'Chỉ quân sự'], answer: 'Y tế, tài chính, giáo dục, giao thông...', explanation: '从医疗诊断到金融分析...渗透到了我们生活的方方面面' },
      { question: 'Hệ thống gia sư AI có ưu điểm gì?', options: ['Thay thế hoàn toàn giáo viên', 'Cung cấp phương án giảng dạy cá nhân hóa', 'Miễn phí hoàn toàn', 'Không cần internet'], answer: 'Cung cấp phương án giảng dạy cá nhân hóa', explanation: '根据每个学生的学习进度和薄弱环节，提供个性化的教学方案' },
      { question: 'Vấn đề việc làm trong tương lai là gì?', options: ['Sẽ có thêm nhiều việc làm', 'Nhiều công việc lặp lại sẽ bị tự động hóa thay thế', 'Mọi người sẽ không cần làm việc', 'Lương sẽ tăng gấp đôi'], answer: 'Nhiều công việc lặp lại sẽ bị tự động hóa thay thế', explanation: '许多重复性的工作岗位将被自动化取代' },
      { question: 'Vấn đề đạo đức của AI liên quan đến?', options: ['Giá thành quá đắt', 'Trách nhiệm khi AI ra quyết định liên quan mạng sống', 'AI quá chậm', 'AI không đẹp'], answer: 'Trách nhiệm khi AI ra quyết định liên quan mạng sống', explanation: '当AI系统做出涉及人类生命和权益的决策时，谁应该承担责任？' },
      { question: 'Theo tác giả, giáo dục nên tập trung bồi dưỡng?', options: ['Kỹ năng lập trình', 'Tư duy phản biện, sáng tạo và đồng cảm', 'Chỉ toán học', 'Chỉ tiếng Anh'], answer: 'Tư duy phản biện, sáng tạo và đồng cảm', explanation: '培养人们的批判性思维、创造力和同理心' },
      { question: '"技术是一把双刃剑" nghĩa là gì?', options: ['Công nghệ rất nguy hiểm', 'Công nghệ vừa có lợi vừa có hại', 'Công nghệ giống như gươm', 'Công nghệ chỉ có lợi'], answer: 'Công nghệ vừa có lợi vừa có hại', explanation: 'Gươm hai lưỡi (双刃剑) = thứ vừa có mặt tốt vừa có mặt xấu' },
      { question: 'Thái độ nào được khuyến nghị đối với AI?', options: ['Sợ hãi và từ chối', 'Cởi mở nhưng thận trọng', 'Chấp nhận hoàn toàn không suy nghĩ', 'Phớt lờ hoàn toàn'], answer: 'Cởi mở nhưng thận trọng', explanation: '保持开放而审慎的态度 = giữ thái độ cởi mở nhưng thận trọng' },
    ],
  },
]

async function main() {
  console.log('📖 Seeding reading passages...')
  for (const p of passages) {
    await prisma.readingPassage.upsert({
      where: { id: p.id },
      create: p,
      update: { content: p.content, vocabulary: p.vocabulary, questions: p.questions, translation: p.translation, pinyin: p.pinyin, tags: p.tags, wordCount: p.wordCount },
    })
    console.log(`  ✅ ${p.titleVi} (HSK ${p.hskLevel}, ${p.wordCount} chữ)`)
  }
  console.log('🎉 Done!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
