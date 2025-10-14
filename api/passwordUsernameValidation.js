export function validatePasswordSimple(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Validera användarnamn
export function validateUsername(username) {
  const errors = [];

  // Minst 3 tecken
  if (username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }

  // Max 30 tecken
  if (username.length > 30) {
    errors.push("Username must be less than 30 characters");
  }

  // Bara alfanumeriska tecken, underscore och bindestreck
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, underscore and hyphen");
  }

  // Måste börja med en bokstav
  if (!/^[a-zA-Z]/.test(username)) {
    errors.push("Username must start with a letter");
  }

  // Får inte sluta med underscore eller bindestreck
  if (/[_-]$/.test(username)) {
    errors.push("Username cannot end with underscore or hyphen");
  }

  // Reserverade användarnamn (case-insensitive)
  const reservedNames = [
    'admin', 'administrator', 'moderator', 'mod', 'root',
    'system', 'support', 'help', 'api', 'null', 'undefined',
    'deleted', 'deleteduser', 'removed', 'removeduser',
    'borttagen', 'borttagenuser', 'borttagenanvandare',
    'anonymous', 'anonym', 'guest', 'gast',
    'user', 'anvandare', 'member', 'medlem',
    'official', 'staff', 'team', 'service',
    'info', 'contact', 'kontakt', 'webmaster',
    'postmaster', 'hostmaster', 'abuse', 'security',
    'test', 'demo', 'example', 'sample'
  ];

  if (reservedNames.includes(username.toLowerCase())) {
    errors.push("This username is reserved and cannot be used");
  }

  // Blockera reserverade ord + siffror (ex: admin123, deleteduser4)
  const reservedPatterns = [
    /^admin\d*$/i,           // admin, admin1, admin123
    /^administrator\d*$/i,   // administrator, administrator1
    /^moderator\d*$/i,       // moderator, moderator123
    /^mod\d*$/i,             // mod, mod1, mod99
    /^deleted\d*$/i,         // deleted, deleted1
    /^deleteduser\d*$/i,     // deleteduser, deleteduser4
    /^removed\d*$/i,         // removed, removed123
    /^removeduser\d*$/i,     // removeduser, removeduser5
    /^borttagen\d*$/i,       // borttagen, borttagen1
    /^borttagenuser\d*$/i,   // borttagenuser, borttagenuser2
    /^system\d*$/i,          // system, system1
    /^root\d*$/i,            // root, root123
    /^official\d*$/i,        // official, official1
    /^guest\d*$/i,           // guest, guest123
    /^anonymous\d*$/i,       // anonymous, anonymous1
    /^support\d*$/i,         // support, support1
    /^staff\d*$/i,           // staff, staff1
    /^team\d*$/i             // team, team1
  ];

  for (const pattern of reservedPatterns) {
    if (pattern.test(username)) {
      errors.push("This username is reserved and cannot be used");
      break;
    }
  }

  // Blockera namn som BÖRJAR med reserverade ord (ex: admin_test, deleted_user)
  const forbiddenPrefixes = [
    'admin', 'moderator', 'mod', 'deleted', 'removed',
    'borttagen', 'system', 'official', 'root', 'staff'
  ];

  for (const prefix of forbiddenPrefixes) {
    if (username.toLowerCase().startsWith(prefix)) {
      errors.push(`Username cannot start with "${prefix}"`);
      break;
    }
  }

  // Blockera namn som INNEHÅLLER reserverade ord (ex: my_admin_account)
  const forbiddenSubstrings = [
    'admin', 'moderator', 'deleted', 'removed',
    'borttagen', 'system', 'official'
  ];

  for (const forbidden of forbiddenSubstrings) {
    if (username.toLowerCase().includes(forbidden)) {
      errors.push(`Username cannot contain the word "${forbidden}"`);
      break;
    }
  }

  // Får inte innehålla upprepade specialtecken (____, ----)
  if (/_{3,}/.test(username) || /-{3,}/.test(username)) {
    errors.push("Username cannot contain repeated underscores or hyphens");
  }

  // Får inte vara bara siffror
  if (/^\d+$/.test(username)) {
    errors.push("Username cannot be only numbers");
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}