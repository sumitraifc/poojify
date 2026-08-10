import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Info } from "lucide-react";

/**
 * Use these everywhere instead of importing react-hot-toast directly,
 * so tone/copy/icons stay consistent app-wide.
 */
export const showToast = {
  success: (msg) => toast.success(msg, { icon: <CheckCircle2 className="h-4 w-4 text-success" /> }),
  error: (msg) => toast.error(msg, { icon: <XCircle className="h-4 w-4 text-danger" /> }),
  info: (msg) => toast(msg, { icon: <Info className="h-4 w-4 text-primary-500" /> }),
};

export default showToast;
