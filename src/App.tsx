import React, { useMemo, useRef, useState } from "react";
import {
  CompositeDecorator,
  ContentState,
  DraftDecorator,
  DraftStyleMap,
  Editor,
  EditorState,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import classNames from "classnames";
import {
  createLinkEntity,
  getEntitiesFromSelection,
  getSvgUrl,
  getURLFromLinkEntity,
  isSelectionInRange,
} from "./utils";
import DraftLinkPrompt from "./components/feature/DraftLinkPrompt";
import useAsyncPrompt from "./hooks/useAsyncPrompt/useAsyncPrompt";
import { editLinkEntity } from "./utils/utils";

const styleMap: DraftStyleMap = {};

const colorMap: DraftStyleMap = {
  PRIMARY_RED_1: {
    color: "#DF3232", // EWC Red
  },
  PRIMARY_RED_2: {
    color: "#C62829", // EWC Red2
  },
  PRIMARY_RED_3: {
    color: "#F3BBBB", // EWC Red3
  },
  PRIMARY_RED_4: {
    color: "#FFF4F4", // EWC Lavenderblush
  },
  SECONDARY_GREEN_1: {
    color: "#16C0C0", // EWC Green
  },
  SECONDARY_GREEN_2: {
    color: "#0FA0A0", // EWC Green2
  },
  SECONDARY_GREEN_3: {
    color: "#7FDCDC", // EWC Green3
  },
  SECONDARY_GREEN_4: {
    color: "#E3F2F5", // EWC Mintcream
  },
  GRAY_1: {
    color: "#515151", // EWC Gray (Midnight)
  },
  GRAY_2: {
    color: "#636363", // EWC Gray (Dark Gray)
  },
  GRAY_3: {
    color: "#C2C2C2", // EWC Gray (Medium Gray)
  },
  GRAY_4: {
    color: "#ECECEC", // EWC Gray (Gray)
  },
  GRAY_5: {
    color: "#F4F4F4", // EWC Gray (Light Gray)
  },
  BLACK_1: {
    color: "#282828", // EWC Black2 (Tints)
  },
  BLACK_2: {
    color: "#333333", // EWC BG Dark (Background – Dark)
  },
  WHITE_1: {
    color: "#FFFFFF", // EWC White
  },
  WHITE_2: {
    color: "#FBFBFB", // EWC BG Light
  },
};

const findLinkEntities: DraftDecorator["strategy"] = (
  contentBlock,
  callback,
  contentState
) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
};

const Link: React.FC<{ contentState: ContentState; entityKey: string }> = ({
  contentState,
  entityKey,
  children,
}) => {
  const { url } = contentState.getEntity(entityKey).getData();

  return (
    <a
      href={url}
      style={{ color: "blue", textDecoration: "underline" }}
      title={url}
    >
      {children}
    </a>
  );
};

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

const App = () => {
  const [editorState, setEditorState] = useState<EditorState>(() =>
    EditorState.createEmpty(decorator)
  );
  const draftRef = useRef<Editor>(null);

  return (
    <div
      className={classNames("h-screen", "min-w-screen", "bg-gray-300", "py-6")}
    >
      <div
        tabIndex={2}
        onFocus={() => draftRef.current?.focus()}
        className={classNames("mx-auto", "w-[843px]", "min-h-full", "bg-white")}
      >
        <Toolbar editorState={editorState} setEditorState={setEditorState} />
        <Editor
          ref={draftRef}
          editorState={editorState}
          onChange={setEditorState}
          tabIndex={2}
          customStyleMap={{ ...styleMap, ...colorMap }}
        />
      </div>
    </div>
  );
};

export default App;

const Toolbar: React.FC<{
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
}> = ({ editorState, setEditorState }) => {
  const { isAsyncPromptOpen, prompt, handleClose, handleConfirm } =
    useAsyncPrompt<string | false>();
  const italicStyleHandler = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
  };

  const boldStyleHandler = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
  };

  const underlineStyleHandler = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
  };

  const isSelectionInLink = useMemo(() => {
    const selection = editorState.getSelection();

    const entities = getEntitiesFromSelection(editorState, "LINK");
    const entity = entities.find(({ start, end, blockKey }) => {
      return isSelectionInRange(selection, { start, end, blockKey });
    });

    return {
      entity,
      inLink: !!entity,
    };
  }, [editorState]);

  const linkAttributeHandler = async () => {
    const url = await prompt();
    if (url === false) return;

    if (isSelectionInLink.inLink) {
      const entity = isSelectionInLink.entity;
      if (!entity) return;
      const entitySelection = entity.entity.getData().selectionState;
      if (url.length === 0) {
        setEditorState(
          RichUtils.toggleLink(editorState, entitySelection, null)
        );
      } else {
        editLinkEntity(editorState, {
          entityKey: entity.entityKey,
          url,
          selectionState: entity.entity.getData().selectionState,
        });
      }
    } else {
      if (url.length === 0) {
        return;
      } else {
        setEditorState(
          createLinkEntity(editorState, editorState.getSelection(), url)
        );
      }
    }
  };

  return (
    <div
      className={classNames(
        "flex",
        "justify-center",
        "items-center",
        "py-3",
        "border-b",
        "border-gray-300",
        "border-solid"
      )}
    >
      <DraftLinkPrompt
        open={isAsyncPromptOpen}
        confirmHandler={handleConfirm}
        cancelHandler={() => handleClose(false)}
        currentSelectionURL={getURLFromLinkEntity(isSelectionInLink.entity)}
      />
      <button onClick={italicStyleHandler} className={classNames("mr-3")}>
        <svg className={classNames("w-5", "h-5")}>
          <use {...getSvgUrl("text_italic")} />
        </svg>
      </button>
      <button onClick={boldStyleHandler} className={classNames("mr-3")}>
        <svg className={classNames("w-5", "h-5")}>
          <use {...getSvgUrl("text_bold")} />
        </svg>
      </button>
      <button onClick={underlineStyleHandler} className={classNames("mr-3")}>
        <svg className={classNames("w-5", "h-5")}>
          <use {...getSvgUrl("text_underline")} />
        </svg>
      </button>
      <div className={classNames("w-[1px]", "h-6", "bg-[#bdbdbd]", "mr-3")} />
      <ColorPicker
        colorHandler={(color: string) =>
          setEditorState(RichUtils.toggleInlineStyle(editorState, color))
        }
      />
      <div className={classNames("w-[1px]", "h-6", "bg-[#bdbdbd]", "mr-3")} />
      <button
        className={classNames(
          "mr-3",
          isSelectionInLink.inLink && "bg-gray-600",
          "rounded-md"
        )}
        onClick={linkAttributeHandler}
      >
        <svg
          className={classNames(
            "w-5",
            "h-5",
            isSelectionInLink.inLink && "text-white"
          )}
        >
          <use {...getSvgUrl("link")} />
        </svg>
      </button>
      <div className={classNames("w-[1px]", "h-6", "bg-[#bdbdbd]", "mr-3")} />
      <button className={classNames("flex", "items-center", "mr-3")}>
        <svg className={classNames("w-5", "h-5", "mr-0.5")}>
          <use {...getSvgUrl("text_align")} />
        </svg>
        <svg className={classNames("w-1.5", "h-1")}>
          <use {...getSvgUrl("caret_down")} />
        </svg>
      </button>
      <div className={classNames("w-[1px]", "h-6", "bg-[#bdbdbd]", "mr-3")} />
      <button className={classNames("mr-3")}>
        <svg className={classNames("w-5", "h-5")}>
          <use {...getSvgUrl("un_order_list")} />
        </svg>
      </button>
      <button className={classNames("mr-3")}>
        <svg className={classNames("w-5", "h-5")}>
          <use {...getSvgUrl("order_list")} />
        </svg>
      </button>
    </div>
  );
};

const ColorPicker: React.FC<{ colorHandler: (color: string) => void }> = ({
  colorHandler,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={classNames("relative", "h-5")}>
      <button
        className={classNames("mr-3")}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <svg className={classNames("w-5", "h-5")}>
          <use {...getSvgUrl("text_color")} />
        </svg>
      </button>
      <div
        className={classNames(
          "absolute",
          "overflow-hidden",
          isOpen ? "max-h-[999px]" : "max-h-0",
          "shadow"
        )}
      >
        <div
          className={classNames(
            "w-[4.5rem]",
            "bg-white",
            "flex",
            "flex-shrink-0",
            "flex-wrap",
            "pt-2",
            "pl-2",
            "rounded-md"
          )}
        >
          {Object.keys(colorMap).map((color) => (
            <button
              key={color}
              className={classNames(
                "w-6",
                "h-6",
                "mr-2",
                "mb-2",
                "rounded-sm",
                "border",
                "z-[2]"
              )}
              style={{ backgroundColor: colorMap[color].color }}
              onClick={() => colorHandler(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
