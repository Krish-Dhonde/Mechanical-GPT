import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useChatStore } from "../store/useChatStore";
import { FiPlus } from "react-icons/fi";

export default function ImageUploader() {
  const { setInputs, inputs } = useChatStore();

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const reader = new FileReader();
      reader.onload = () => {
        setInputs({
          ...inputs,
          image: reader.result,
        });
      };
      reader.readAsDataURL(file);
    },
    [inputs, setInputs],
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className="cursor-pointer p-2 border border-border-gray rounded-lg hover:bg-gray-100"
    >
      <input {...getInputProps()} />
      <FiPlus size={20} />
    </div>
  );
}
