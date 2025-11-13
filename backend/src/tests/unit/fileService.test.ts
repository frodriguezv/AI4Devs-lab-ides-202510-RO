import {
  sanitizeFileName,
  generateUniqueFileName,
  validateFileType,
  validateFileSize,
} from '../../services/fileService';

describe('File Service', () => {
  describe('sanitizeFileName', () => {
    it('should sanitize dangerous characters', () => {
      const dangerous = '../../../etc/passwd';
      const sanitized = sanitizeFileName(dangerous);
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('/');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300);
      const sanitized = sanitizeFileName(longName);
      expect(sanitized.length).toBeLessThanOrEqual(255);
    });

    it('should preserve safe characters', () => {
      const safe = 'resume_2024.pdf';
      const sanitized = sanitizeFileName(safe);
      expect(sanitized).toContain('resume');
      expect(sanitized).toContain('2024');
    });
  });

  describe('generateUniqueFileName', () => {
    it('should generate unique filenames', () => {
      const original = 'resume.pdf';
      const name1 = generateUniqueFileName(original);
      const name2 = generateUniqueFileName(original);

      expect(name1).not.toBe(name2);
      expect(name1).toContain('resume');
      expect(name1).toContain('.pdf');
    });

    it('should preserve file extension', () => {
      const original = 'document.docx';
      const unique = generateUniqueFileName(original);
      expect(unique.endsWith('.docx')).toBe(true);
    });
  });

  describe('validateFileType', () => {
    it('should accept valid PDF file', () => {
      const file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it('should accept valid DOCX file', () => {
      const file = {
        originalname: 'test.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      } as Express.Multer.File;

      const result = validateFileType(file);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid MIME type', () => {
      const file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
      } as Express.Multer.File;

      const result = validateFileType(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid file extension', () => {
      const file = {
        originalname: 'test.exe',
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const result = validateFileType(file);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should accept valid file size', () => {
      const size = 5 * 1024 * 1024; // 5MB
      const result = validateFileSize(size);
      expect(result.valid).toBe(true);
    });

    it('should reject file that is too large', () => {
      const size = 11 * 1024 * 1024; // 11MB
      const result = validateFileSize(size);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });

    it('should reject empty file', () => {
      const result = validateFileSize(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });
  });
});

