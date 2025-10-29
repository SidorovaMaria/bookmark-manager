//components/ui/FormModal.tsx
"use client";
/**
 * FormModal — a small wrapper around Radix Dialog for embedding custom form/content.
 *   Goals:
 * - Drop-in modal with a trigger (children), a title/description header,
 *   and a flexible body (your form) that receives a `closeForm()` prop.
 * - Works both controlled (via `open` + `onOpenChange`) and uncontrolled (internal state).
 * - Keeps animations and theming outside the component via className slots.
 * - Sensible accessibility defaults via Radix (focus trap, roles, keyboard support).
 * Example:
 * <FormModal
 *   title="Create budget"
 *   description="Fill in the fields below."
 *   modalContent={<CreateBudgetForm />}
 * >
 *   <Button tier="primary">New budget</Button>
 * </FormModal>
 * Inside your form:
 * ```tsx
 * function CreateBudgetForm({ closeForm }: { closeForm?: () => void }) {
 *   return (
 *     <form
 *       onSubmit={async (e) => {
 *         e.preventDefault();
 *         await save(); // your async work
 *         closeForm?.(); // close on success
 *       }}
 *     >
 *       ...
 *     </form>
 *   );
 * }
 * ```
 */
import * as Dialog from "@radix-ui/react-dialog";
import { cloneElement, useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
type ModalBodyProps = {
  /** Provided to your content so it can close the modal (e.g., after a successful submit). */
  closeForm?: () => void;
};

type Props = {
  /** The trigger element shown outside the modal. Rendered inside `<Dialog.Trigger asChild>` */
  children?: React.ReactNode;
  /** The content shown inside the modal. `closeForm` will be injected. */
  modalContent: React.ReactElement<ModalBodyProps>;
  /** Dialog title (required for screen readers). */
  title: string;
  /** Optional supportive text under the title. */
  description: string;

  /** Controlled open state. Omit to use internal state. */
  open?: boolean;

  /** Controlled open changer. Required if `open` is provided. */
  onOpenChange?: (open: boolean) => void;

  /** Optional key to open the modal via keyboard shortcut. */
  openKey?: string;
};
const FormModal = ({
  modalContent,
  children,
  title,
  description,
  open: controlledOpen,
  openKey,
  onOpenChange,
}: Props) => {
  // Uncontrolled state if `open` isn’t provided
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next);
      else setUncontrolledOpen(next);
    },
    [isControlled, onOpenChange]
  );

  // Stable close function passed into your form
  const close = useCallback(() => setOpen(false), [setOpen]);

  // Inject `closeForm` into the provided content
  const contentWithProps = useMemo(
    () => cloneElement(modalContent, { closeForm: close }),
    [modalContent, close]
  );
  useEffect(() => {
    if (!openKey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === openKey) {
        if (!open) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openKey, open, setOpen]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} modal>
      {/* TRIGGER — This is whatever you pass as `children` */}
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        {/* OVERLAY — Keep mounted to allow exit animations */}
        <Dialog.Overlay
          forceMount
          className="fixed inset-0 bg-[#131313]/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none z-50"
        />
        {/* CONTENT — The dialog panel */}
        <Dialog.Content
          forceMount
          className="fixed position-center
                     p-8 rounded-2xl flex flex-col max-md:gap-4 gap-8
                     bg-n-0 dark:bg-n-800 min-w-[85vw] md:min-w-[570px]
                     data-[state=open]:animate-pop-in-fade
                     data-[state=closed]:animate-pop-out-fade
                     motion-reduce:animate-none z-50"
        >
          {/* Header */}
          <div className="flex flex-col w-full gap-2">
            <Dialog.Title className="text-1">{title}</Dialog.Title>
            <Dialog.Description className="text-4-medium text-subtle">
              {description}
            </Dialog.Description>
          </div>
          {/* BODY — Your form/content gets `closeForm` injected */}
          {contentWithProps}
          {/* TOP-RIGHT CLOSE — Uses your shared Button component */}
          <Dialog.Close asChild>
            <Button
              tier="secondary"
              size="sm"
              aria-label="Close dialog"
              className=" absolute top-5 right-5 size-8"
              icon={<X className="z-10 size-8" />}
            />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FormModal;
