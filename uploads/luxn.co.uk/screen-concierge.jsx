// LUXN — Concierge screen (Interactive Simulated Chat Asistant)

function ConciergeScreen({ t, lang, go }) {
  const [messages, setMessages] = React.useState([
    {
      id: "welcome",
      sender: "agent",
      text: t.concierge.welcome_msg,
      timestamp: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-GB", { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef(null);

  // Auto scroll to bottom of chat
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickReplies = lang === "tr" ? [
    { label: "Como Gölü'nde villa öner", type: "stay", id: "s2" },
    { label: "Spor araba arıyorum", type: "drive", id: "c2" },
    { label: "Bodrum'da yat tavsiyesi", type: "sail", id: "y1" },
    { label: "Üye avantajları nelerdir?", type: "info" }
  ] : [
    { label: "Recommend a Lake Como stay", type: "stay", id: "s2" },
    { label: "Looking for a sports car", type: "drive", id: "c2" },
    { label: "Bodrum yacht suggestion", type: "sail", id: "y1" },
    { label: "What are the member perks?", type: "info" }
  ];

  const triggerAgentReply = (userMsg) => {
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "";
      let recommendedItem = null;
      let recommendedCat = "";

      const lower = userMsg.toLowerCase();

      if (lower.includes("como") || lower.includes("s2")) {
        replyText = lang === "tr" 
          ? "Como Gölü kıyısında Aman Notturno şüphesiz en prestijli tercihimizdir. 12 odası ve nefes kesici göl manzarasıyla size özel bir deneyim sunar."
          : "On Lake Como, Aman Notturno is without doubt our most prestigious recommendation. With its 12 keys and breathtaking lakefront views, it offers an exceptional experience.";
        recommendedItem = (window.STAYS || []).find(s => s.id === "s2");
        recommendedCat = "stay";
      } else if (lower.includes("spor") || lower.includes("sport") || lower.includes("c2") || lower.includes("porsche")) {
        replyText = lang === "tr"
          ? "Côte d'Azur rotanız için Porsche 911 Targa 4S modelimizi tavsiye ederim. Harika bir yol tutuşu ve 443 beygir gücüyle sürüş zevkinizi zirveye çıkaracaktır."
          : "For your Côte d'Azur drive, I highly recommend the Porsche 911 Targa 4S. It offers incredible handling and 443 horsepower to elevate your driving experience.";
        recommendedItem = (window.CARS || []).find(c => c.id === "c2");
        recommendedCat = "drive";
      } else if (lower.includes("bodrum") || lower.includes("y1") || lower.includes("yat") || lower.includes("yacht")) {
        replyText = lang === "tr"
          ? "Ege kıyıları için 38 metrelik şık Solstice yelkenlimizi öneriyorum. 5 lüks kabini ve profesyonel mürettebatıyla Bodrum sularında rüya gibi bir seyir sağlar."
          : "For the Aegean waters, I suggest our elegant 38-metre sailing yacht, Solstice. With 5 luxury cabins and a professional crew, it promises a dreamlike voyage in Bodrum.";
        recommendedItem = (window.YACHTS || []).find(y => y.id === "y1");
        recommendedCat = "sail";
      } else if (lower.includes("üye") || lower.includes("avantaj") || lower.includes("member") || lower.includes("perk") || lower.includes("info")) {
        replyText = lang === "tr"
          ? "LUXN üyeliği size ücretsiz concierge hizmeti, özel transferler, araç teslimatlarında %10 indirim ve belirli otellerde odayı bir üst sınıfa yükseltme imkanı sunar. Üyelik tamamen ücretsizdir, hesap açmanız yeterlidir."
          : "LUXN membership offers complimentary concierge services, private airport transfers, a 10% discount on vehicle deliveries, and room upgrades at selected stays. Membership is free — simply sign up.";
      } else {
        replyText = lang === "tr"
          ? "Bunu sizin için araştırıp hemen döneceğim. Bu sırada arama panelini kullanabilir ya da diğer günce rotalarımızı inceleyebilirsiniz. Size yardımcı olmamı istediğiniz başka bir konu var mı?"
          : "I will look into that for you right away. In the meantime, feel free to use the search bar or explore our curated journal routes. Is there anything else I can assist you with?";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "agent",
          text: replyText,
          item: recommendedItem,
          category: recommendedCat,
          timestamp: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-GB", { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1200);
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "user",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-GB", { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    if (!textToSend) setInputText("");
    triggerAgentReply(text);
  };

  return (
    <main className="concierge-screen-wrap">
      <section className="container concierge-screen">
        <div className="breadcrumb">
          <button onClick={() => go({ screen: "home" })}>LUXN</button>
          <span className="sep">/</span>
          <span className="here">{t.nav.concierge}</span>
        </div>

        <div className="concierge-chat-container">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-avatar">A</div>
            <div className="chat-header-info">
              <h1 className="chat-title display">{t.concierge.chat_title}</h1>
              <div className="chat-status">{t.concierge.status}</div>
            </div>
          </div>

          {/* Chat Logs */}
          <div className="chat-logs" ref={scrollRef}>
            {messages.map(m => (
              <div key={m.id} className={`chat-msg-row ${m.sender}`}>
                <div className="chat-bubble">
                  <div className="chat-text">{m.text}</div>
                  
                  {/* Rich Recommendation Card */}
                  {m.item && (
                    <div className="chat-recommendation-card" onClick={() => go({ screen: "detail", category: m.category, id: m.item.id })}>
                      <div className="rec-img">
                        <window.SmartImage src={window.imageFor(m.item, m.category)} alt={m.item.name} tone={m.item.tone} />
                      </div>
                      <div className="rec-meta">
                        <div className="rec-loc mono">{m.item.loc}</div>
                        <div className="rec-name">{m.item.name}</div>
                        <div className="rec-price mono">
                          {m.item.currency}{m.item.price.toLocaleString()}
                          <span>{m.category === "sail" ? t.results.per_week : m.category === "drive" ? t.results.per_day : t.results.per_night}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="chat-time mono">{m.timestamp}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-msg-row agent">
                <div className="chat-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          <div className="chat-quick-replies">
            {quickReplies.map((qr, idx) => (
              <button key={idx} className="btn btn-ghost btn-sm" onClick={() => handleSend(qr.label)}>
                {qr.label}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form className="chat-input-bar" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input
              type="text"
              placeholder={t.concierge.placeholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="btn btn-accent btn-sm" disabled={isTyping || !inputText.trim()}>
              {lang === "tr" ? "Gönder" : "Send"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

window.ConciergeScreen = ConciergeScreen;
