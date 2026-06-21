// 코스콕 — Journal: 여행 장소별 기록(추억) CRUD 블록
(function () {
  const { Icon } = window;
  const DS = window.DesignSystem_3a93b9;
  const { Button } = DS;
  const { PhotoUploader, StarPick } = window.Kit;

  const uid = () => 'e' + Math.random().toString(36).slice(2, 8);

  // 한 기록 입력/수정 폼
  function EntryEditor({ initial, onSave, onCancel }) {
    const [photos, setPhotos] = React.useState(initial ? initial.photos : []);
    const [text, setText] = React.useState(initial ? initial.text : '');
    const [rating, setRating] = React.useState(initial ? initial.rating : 5);

    return (
      <div style={{ background: 'var(--coral-50)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--coral-100)', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--coral-700)' }}>만족도</span>
          <StarPick value={rating} onChange={setRating} size={24} />
        </div>
        <PhotoUploader photos={photos} onChange={setPhotos} max={4} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
          placeholder="이곳에서의 순간을 기록해보세요. 무엇이 좋았나요?"
          style={{ width: '100%', marginTop: 12, padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', resize: 'vertical', fontSize: 14.5, fontFamily: 'var(--font-sans)', lineHeight: 1.6, outline: 'none', background: 'var(--surface)', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="ghost" size="sm" onClick={onCancel}>취소</Button>
          <Button variant="primary" size="sm" disabled={!text.trim() && photos.length === 0}
            leftIcon={<Icon name="check" size={15} />}
            onClick={() => onSave({ id: initial ? initial.id : uid(), photos, text: text.trim(), rating })}>
            {initial ? '수정 완료' : '기록 저장'}
          </Button>
        </div>
      </div>
    );
  }

  // 저장된 기록 1개 (읽기 + 수정/삭제)
  function EntryView({ entry, onEdit, onDelete }) {
    return (
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)', padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: photos(entry) ? 10 : 8 }}>
          <StarPick value={entry.rating} readOnly size={16} />
          <div style={{ flex: 1 }} />
          <button onClick={onEdit} aria-label="수정" style={iconBtn}><Icon name="pencil" size={15} /></button>
          <button onClick={onDelete} aria-label="삭제" style={iconBtn}><Icon name="trash" size={15} /></button>
        </div>
        {photos(entry) && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {entry.photos.map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 'calc(33.333% - 6px)', maxWidth: 150, aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        )}
        {entry.text && <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{entry.text}</p>}
      </div>
    );
  }
  const photos = (e) => e.photos && e.photos.length > 0;

  // 한 장소의 기록 블록 (여러 entry CRUD)
  function JournalBlock({ entries = [], onChange }) {
    const [mode, setMode] = React.useState(null); // null | 'new' | editId

    const add = (entry) => { onChange([...(entries || []), entry]); setMode(null); };
    const update = (entry) => { onChange(entries.map((e) => (e.id === entry.id ? entry : e))); setMode(null); };
    const del = (id) => onChange(entries.filter((e) => e.id !== id));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map((e) => (
          mode === e.id
            ? <EntryEditor key={e.id} initial={e} onSave={update} onCancel={() => setMode(null)} />
            : <EntryView key={e.id} entry={e} onEdit={() => setMode(e.id)} onDelete={() => del(e.id)} />
        ))}
        {mode === 'new'
          ? <EntryEditor onSave={add} onCancel={() => setMode(null)} />
          : (
            <button onClick={() => setMode('new')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
              padding: '11px 0', borderRadius: 'var(--radius-md)', border: '1.5px dashed var(--coral-200)',
              background: 'transparent', color: 'var(--coral-600)', cursor: 'pointer', fontWeight: 700, fontSize: 13.5, fontFamily: 'var(--font-sans)',
            }}>
              <Icon name="camera" size={17} />{entries.length ? '기록 더 남기기' : '사진·후기 기록하기'}
            </button>
          )}
      </div>
    );
  }

  const iconBtn = { border: 'none', background: 'var(--gray-50)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  window.JournalBlock = JournalBlock;
})();
