import React, { useCallback } from "react";
import classNames from "classnames";
import { createPortal } from "react-dom";

type DivProps = JSX.IntrinsicElements["div"];

interface Props extends Omit<DivProps, "onClick"> {
  visible: boolean;
  onBackdrop?: DivProps["onClick"];
  disableDefaultZIndex?: boolean;
  backdrop?: "invisible" | "transparent";
}

export const Modal: React.FC<Props> = ({
  children,
  visible,
  onBackdrop,
  className,
  backdrop = "transparent",
  disableDefaultZIndex,
  ...props
}) => {
  const clickHandler: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.stopPropagation();
      onBackdrop?.(e);
    },
    [onBackdrop]
  );
  if (!visible) return null;

  return createPortal(
    <div
      onClick={clickHandler}
      className={classNames(
        className,
        "flex",
        "justify-center",
        "items-center",
        "bg-black",
        {
          "bg-opacity-60": backdrop === "transparent",
          "bg-opacity-100": backdrop === "invisible",
        },
        "w-screen",
        "h-screen",
        { "z-[999]": !disableDefaultZIndex },
        "fixed",
        "top-0",
        "left-0"
      )}
      {...props}
    >
      {children}
    </div>,
    document.querySelector("#root")!
  );
};

export default Modal;
