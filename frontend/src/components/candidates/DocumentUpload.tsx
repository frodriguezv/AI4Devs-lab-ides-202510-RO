import React, { useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { CreateCandidateInput } from '../../utils/validation';
import { ErrorMessage } from '../common/ErrorMessage';

interface DocumentUploadProps {
  setValue: UseFormSetValue<CreateCandidateInput>;
  watch: UseFormWatch<CreateCandidateInput>;
  error?: FieldErrors<CreateCandidateInput>['cvFile'];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  setValue,
  watch,
  error,
}) => {
  const cvFile = watch('cvFile');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rootDivRef = useRef<HTMLDivElement | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setValue('cvFile', acceptedFiles[0], { shouldValidate: true });
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    noClick: false,
  });

  const rootProps = getRootProps();
  const inputProps = getInputProps();

  // Handle click on the root div to ensure file input opens
  const handleRootClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger if clicking directly on the input
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    
    // Manually trigger file input click - find it directly if ref isn't set
    const triggerInput = () => {
      let input = fileInputRef.current;
      if (!input) {
        // Fallback: find input directly
        input = document.querySelector('input[type="file"][aria-label="CV file input"]') as HTMLInputElement;
        if (input) {
          fileInputRef.current = input;
        }
      }
      
      if (input && !isDragActive) {
        input.click();
      }
    };
    
    // Use setTimeout to ensure the click happens after event handling
    setTimeout(triggerInput, 0);
  }, [isDragActive]);

  // Store the latest isDragActive value in a ref so event listener can access it
  const isDragActiveRef = useRef(isDragActive);
  useEffect(() => {
    isDragActiveRef.current = isDragActive;
  }, [isDragActive]);

  // Merge refs and override onClick completely, and set up direct event listener
  const mergedRootProps = {
    ...rootProps,
    ref: (node: HTMLDivElement | null) => {
      rootDivRef.current = node;
      // Call the original ref from getRootProps if it exists
      if (typeof rootProps.ref === 'function') {
        rootProps.ref(node);
      } else if (rootProps.ref) {
        (rootProps.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      
      // Set up direct event listener when ref is set
      if (node) {
        const handleClick = (e: MouseEvent) => {
          // Don't trigger if clicking directly on the input
          if ((e.target as HTMLElement).tagName === 'INPUT') {
            return;
          }
          
          // Find and trigger the input
          let input = fileInputRef.current;
          if (!input) {
            input = node.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
              fileInputRef.current = input;
            }
          }
          
          // Use ref to get current isDragActive value
          if (input && !isDragActiveRef.current) {
            e.preventDefault();
            e.stopPropagation();
            input.click();
          }
        };
        
        // Remove any existing listener first (in case ref callback runs multiple times)
        const oldHandler = (node as any).__fileUploadHandler;
        if (oldHandler) {
          node.removeEventListener('click', oldHandler, true);
        }
        
        // Store handler reference for cleanup
        (node as any).__fileUploadHandler = handleClick;
        
        // Add new listener in capture phase to catch clicks early
        node.addEventListener('click', handleClick, true);
      }
    },
    onClick: handleRootClick,
  };

  // Set input ref using a callback ref on the input element, merging with getInputProps ref
  const inputRefCallback = useCallback((node: HTMLInputElement | null) => {
    fileInputRef.current = node;
    // Also call the original ref from getInputProps if it exists
    // Note: getInputProps() doesn't expose ref directly, so we handle it ourselves
  }, []);

  const removeFile = () => {
    setValue('cvFile', undefined as any, { shouldValidate: true });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Upload CV
          <span className="text-red-500 ml-1">*</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Accepted formats: PDF, DOCX (max 10MB)
        </p>
      </div>

      {!cvFile ? (
        <div
          {...mergedRootProps}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${error ? 'border-red-500' : ''}
          `}
        >
          <input 
            {...inputProps} 
            ref={inputRefCallback}
            aria-label="CV file input"
          />
          <svg
            className="mx-auto h-12 w-12 text-gray-400 pointer-events-none"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4 pointer-events-none">
            {isDragActive ? (
              <p className="text-primary-600 font-medium">Drop the file here...</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium">
                  Drag & drop CV here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF or DOCX files only, maximum 10MB
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{cvFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(cvFile.size)} • {cvFile.type}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
              aria-label="Remove file"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <ErrorMessage
          message={
            typeof error === 'string'
              ? error
              : error.message || 'Please upload a valid CV file'
          }
        />
      )}
    </div>
  );
};

