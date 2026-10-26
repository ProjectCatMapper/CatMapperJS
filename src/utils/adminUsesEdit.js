export function getUsesEditError(form) {
  const selection = String(form.s1_7 ?? '').trim();
  const index = Number(selection) - 1;
  if (!/^\d+$/.test(selection) || !Number.isSafeInteger(index) || index < 0) {
    return 'Select a valid USES tie before submitting.';
  }
  const tie = Array.isArray(form.s1_4) ? form.s1_4[index] : null;
  if (!Array.isArray(tie) || !tie[1]?.id || !tie[2]?.CMID
      || tie[0]?.CMID !== String(form.s1_2 || '').trim()) {
    return 'The selected USES tie does not match this category. Refresh the tie list.';
  }
  if (!String(form.s1_8 || '').trim()) return 'Select a USES property before submitting.';
  if (['edit', 'delete'].includes(form.s1_1)
      && !Object.prototype.hasOwnProperty.call(tie[1], form.s1_8)) {
    return 'Select a property on this USES tie before submitting.';
  }
  return '';
}

export function updateUsesEditField(form, name, value) {
  const next = { ...form, [name]: value };
  if (name === 's1_2') {
    return { ...next, s1_4: [], s1_7: '', s1_8: '', s1_3: '' };
  }
  if (name === 's1_7') return { ...next, s1_8: '', s1_3: '' };
  if (name === 's1_8') return { ...next, s1_3: '' };
  return next;
}
