/**
 * @file CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 작성 모달입니다.
 * - 이미지 선택 및 미리보기
 * - 캡션 입력 (최대 2,200자)
 * - 파일 검증 및 업로드
 *
 * @see .cursor/plans/게시물_작성_기능_상세_개발_계획.md
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CAPTION_LENGTH = 2200;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function CreatePostModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePostModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = caption.length;

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 파일 검증
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다.`
        );
        return;
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError("JPEG, PNG, WebP, GIF 파일만 업로드할 수 있습니다.");
        return;
      }

      setError(null);
      setSelectedFile(file);

      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    []
  );

  // 파일 선택 버튼 클릭
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  // 이미지 제거
  const handleRemoveImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  // 업로드 핸들러
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError("이미지를 선택해주세요.");
      return;
    }

    if (charCount > MAX_CAPTION_LENGTH) {
      setError(
        `캡션은 최대 ${MAX_CAPTION_LENGTH}자까지 입력할 수 있습니다.`
      );
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("caption", caption.trim() || "");

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "게시물 업로드에 실패했습니다.");
      }

      // 성공 시 처리
      const data = await response.json();
      console.log("✅ 게시물 업로드 성공:", data);

      // 상태 초기화
      handleRemoveImage();
      setCaption("");

      // 모달 닫기
      onOpenChange(false);

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "알 수 없는 오류가 발생했습니다."
      );
      console.error("❌ 업로드 에러:", err);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, caption, charCount, onOpenChange, onSuccess, handleRemoveImage]);

  // 모달 닫기 시 정리
  const handleClose = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    setError(null);
    setIsUploading(false);
    onOpenChange(false);
  }, [previewUrl, onOpenChange]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle>새 게시물 만들기</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row">
          {/* 이미지 영역 */}
          <div className="w-full md:w-1/2 aspect-square bg-gray-100 flex items-center justify-center relative">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  disabled={isUploading}
                  aria-label="이미지 제거"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="text-center p-8">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-text-secondary mb-4">사진을 선택해주세요</p>
                <Button onClick={handleSelectClick} disabled={isUploading}>
                  사진 선택
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* 입력 영역 */}
          <div className="w-full md:w-1/2 p-6 space-y-4">
            {previewUrl && (
              <>
                <div>
                  <Label htmlFor="caption">문구 입력</Label>
                  <Textarea
                    id="caption"
                    placeholder="문구 입력..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={MAX_CAPTION_LENGTH}
                    className="mt-2 min-h-[120px] resize-none"
                    disabled={isUploading}
                  />
                  <div className="flex justify-end mt-1">
                    <span
                      className={`text-xs ${
                        charCount > MAX_CAPTION_LENGTH
                          ? "text-red-500"
                          : "text-text-secondary"
                      }`}
                    >
                      {charCount.toLocaleString()} /{" "}
                      {MAX_CAPTION_LENGTH.toLocaleString()}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    "공유하기"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

