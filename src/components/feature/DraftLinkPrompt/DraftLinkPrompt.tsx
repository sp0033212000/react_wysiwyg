import React, { useEffect } from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import Joi from "joi";

import { ReactComponent as Unlink } from "../../../../public/icons/unlink.svg";
import Modal from "../Modal/Modal";

interface Props {
  open: boolean;
  confirmHandler: (url: string) => void;
  cancelHandler: () => void;
  currentSelectionURL: string | null;
}
const DraftLinkPrompt: React.FC<Props> = ({
  open,
  confirmHandler,
  cancelHandler,
  currentSelectionURL,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<{ url: string }>({ mode: "all", defaultValues: { url: "" } });

  useEffect(() => {
    if (!currentSelectionURL) {
      reset({ url: "" });
    } else {
      reset({
        url: currentSelectionURL,
      });
    }
  }, [currentSelectionURL]);

  return (
    <Modal onFocus={(e) => e.stopPropagation()} visible={open}>
      <div className={classNames("w-96", "p-6", "bg-white", "rounded-xl")}>
        <h2
          className={classNames(
            "text-2xl",
            "font-bold",
            "text-gray-900",
            "mb-4"
          )}
        >
          請輸入連結
        </h2>
        <input
          {...register("url", {
            validate: (value) => {
              return value &&
                value.length !== 0 &&
                Joi.string().uri().validate(value)?.error
                ? "請輸入正確的網址連結格式。"
                : undefined;
            },
          })}
          className={classNames(
            "h-12",
            "w-full",
            "border",
            "border-solid",
            "border-gray-400",
            "rounded-lg",
            "px-4"
          )}
        />
        {errors.url?.message && (
          <p className={classNames("text-sm", "mt-2", "text-red-500")}>
            {errors.url?.message}
          </p>
        )}
        <div className={classNames("flex", "mt-6", "items-center")}>
          {!!currentSelectionURL && (
            <button
              onClick={() => confirmHandler("")}
              type={"button"}
              className={classNames(
                "w-10",
                "h-10",
                "mr-4",
                "p-3",
                "rounded-cl",
                "hover:bg-gray-500",
                "hover:text-white"
              )}
            >
              <Unlink />
            </button>
          )}
          <button
            type={"button"}
            onClick={cancelHandler}
            className={classNames(
              "flex-1",
              "mr-4",
              "h-12",
              "bg-gray-300",
              "text-white",
              "rounded-xl"
            )}
          >
            取消
          </button>
          <button
            type={"button"}
            onClick={handleSubmit(({ url }) => confirmHandler(url))}
            className={classNames(
              "flex-1",
              "h-12",
              "bg-green-300",
              "text-white",
              "rounded-xl"
            )}
          >
            確定
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DraftLinkPrompt;
