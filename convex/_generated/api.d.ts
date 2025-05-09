/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions from "../functions.js";
import type * as messages from "../messages.js";
import type * as mikebot_actions from "../mikebot/actions.js";
import type * as mikebot_lib from "../mikebot/lib.js";
import type * as mikebot_mutations from "../mikebot/mutations.js";
import type * as mikebot_queries from "../mikebot/queries.js";
import type * as openai_assistants from "../openai/assistants.js";
import type * as openai_files from "../openai/files.js";
import type * as resend_resend from "../resend/resend.js";
import type * as threads from "../threads.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  functions: typeof functions;
  messages: typeof messages;
  "mikebot/actions": typeof mikebot_actions;
  "mikebot/lib": typeof mikebot_lib;
  "mikebot/mutations": typeof mikebot_mutations;
  "mikebot/queries": typeof mikebot_queries;
  "openai/assistants": typeof openai_assistants;
  "openai/files": typeof openai_files;
  "resend/resend": typeof resend_resend;
  threads: typeof threads;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: {
    messages: {
      addMessages: FunctionReference<
        "mutation",
        "internal",
        {
          agentName?: string;
          failPendingSteps?: boolean;
          messages: Array<{
            embedding?: {
              dimension:
                | 128
                | 256
                | 512
                | 768
                | 1024
                | 1536
                | 2048
                | 3072
                | 4096;
              model: string;
              vector: Array<number>;
            };
            error?: string;
            fileId?: string;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            id?: string;
            message:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "text";
                          }
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<string, any>;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            experimental_providerMetadata?: Record<string, any>;
                            mimeType: string;
                            providerOptions?: Record<string, any>;
                            type: "file";
                          }
                      >;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            experimental_providerMetadata?: Record<string, any>;
                            mimeType: string;
                            providerOptions?: Record<string, any>;
                            type: "file";
                          }
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                      >;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    experimental_providerMetadata?: Record<string, any>;
                    isError?: boolean;
                    providerOptions?: Record<string, any>;
                    result: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "tool";
                }
              | {
                  content: string;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "system";
                };
            model?: string;
            provider?: string;
            providerMetadata?: Record<string, Record<string, any>>;
            reasoning?: string;
            sources?: Array<{
              id: string;
              providerMetadata?: Record<string, Record<string, any>>;
              sourceType: "url";
              title?: string;
              url: string;
            }>;
            text?: string;
            usage?: {
              completionTokens: number;
              promptTokens: number;
              totalTokens: number;
            };
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
          parentMessageId?: string;
          pending?: boolean;
          stepId?: string;
          threadId: string;
          userId?: string;
        },
        {
          messages: Array<{
            _creationTime: number;
            _id: string;
            agentName?: string;
            embeddingId?:
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string;
            error?: string;
            fileId?: string;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            id?: string;
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "text";
                          }
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<string, any>;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            experimental_providerMetadata?: Record<string, any>;
                            mimeType: string;
                            providerOptions?: Record<string, any>;
                            type: "file";
                          }
                      >;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            experimental_providerMetadata?: Record<string, any>;
                            mimeType: string;
                            providerOptions?: Record<string, any>;
                            type: "file";
                          }
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                      >;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    experimental_providerMetadata?: Record<string, any>;
                    isError?: boolean;
                    providerOptions?: Record<string, any>;
                    result: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "tool";
                }
              | {
                  content: string;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "system";
                };
            model?: string;
            order: number;
            parentMessageId?: string;
            provider?: string;
            providerMetadata?: Record<string, any>;
            reasoning?: string;
            sources?: Array<{
              id: string;
              providerMetadata?: Record<string, Record<string, any>>;
              sourceType: "url";
              title?: string;
              url: string;
            }>;
            status: "pending" | "success" | "failed";
            stepId?: string;
            stepOrder: number;
            text?: string;
            threadId: string;
            tool: boolean;
            usage?: {
              completionTokens: number;
              promptTokens: number;
              totalTokens: number;
            };
            userId?: string;
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
          pending?: {
            _creationTime: number;
            _id: string;
            agentName?: string;
            embeddingId?:
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string;
            error?: string;
            fileId?: string;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            id?: string;
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "text";
                          }
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<string, any>;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            experimental_providerMetadata?: Record<string, any>;
                            mimeType: string;
                            providerOptions?: Record<string, any>;
                            type: "file";
                          }
                      >;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            experimental_providerMetadata?: Record<string, any>;
                            mimeType: string;
                            providerOptions?: Record<string, any>;
                            type: "file";
                          }
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                      >;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    experimental_providerMetadata?: Record<string, any>;
                    isError?: boolean;
                    providerOptions?: Record<string, any>;
                    result: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "tool";
                }
              | {
                  content: string;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "system";
                };
            model?: string;
            order: number;
            parentMessageId?: string;
            provider?: string;
            providerMetadata?: Record<string, any>;
            reasoning?: string;
            sources?: Array<{
              id: string;
              providerMetadata?: Record<string, Record<string, any>>;
              sourceType: "url";
              title?: string;
              url: string;
            }>;
            status: "pending" | "success" | "failed";
            stepId?: string;
            stepOrder: number;
            text?: string;
            threadId: string;
            tool: boolean;
            usage?: {
              completionTokens: number;
              promptTokens: number;
              totalTokens: number;
            };
            userId?: string;
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          };
        }
      >;
      addStep: FunctionReference<
        "mutation",
        "internal",
        {
          failPendingSteps?: boolean;
          messageId: string;
          step: {
            messages: Array<{
              embedding?: {
                dimension:
                  | 128
                  | 256
                  | 512
                  | 768
                  | 1024
                  | 1536
                  | 2048
                  | 3072
                  | 4096;
                model: string;
                vector: Array<number>;
              };
              error?: string;
              fileId?: string;
              finishReason?:
                | "stop"
                | "length"
                | "content-filter"
                | "tool-calls"
                | "error"
                | "other"
                | "unknown";
              id?: string;
              message:
                | {
                    content:
                      | string
                      | Array<
                          | {
                              experimental_providerMetadata?: Record<
                                string,
                                any
                              >;
                              providerOptions?: Record<string, any>;
                              text: string;
                              type: "text";
                            }
                          | {
                              experimental_providerMetadata?: Record<
                                string,
                                any
                              >;
                              image: string | ArrayBuffer;
                              mimeType?: string;
                              providerOptions?: Record<string, any>;
                              type: "image";
                            }
                          | {
                              data: string | ArrayBuffer;
                              experimental_providerMetadata?: Record<
                                string,
                                any
                              >;
                              mimeType: string;
                              providerOptions?: Record<string, any>;
                              type: "file";
                            }
                        >;
                    experimental_providerMetadata?: Record<string, any>;
                    providerOptions?: Record<string, any>;
                    role: "user";
                  }
                | {
                    content:
                      | string
                      | Array<
                          | {
                              experimental_providerMetadata?: Record<
                                string,
                                any
                              >;
                              providerOptions?: Record<string, any>;
                              text: string;
                              type: "text";
                            }
                          | {
                              data: string | ArrayBuffer;
                              experimental_providerMetadata?: Record<
                                string,
                                any
                              >;
                              mimeType: string;
                              providerOptions?: Record<string, any>;
                              type: "file";
                            }
                          | {
                              experimental_providerMetadata?: Record<
                                string,
                                any
                              >;
                              providerOptions?: Record<string, any>;
                              text: string;
                              type: "reasoning";
                            }
                          | {
                              data: string;
                              experimental_providerMetadata?: Record<
                                string,
                                any
                              >;
                              providerOptions?: Record<string, any>;
                              type: "redacted-reasoning";
                            }
                          | {
                              args: any;
                              experimental_providerMetadata?: Record<
                                string,
                                any
                              >;
                              providerOptions?: Record<string, any>;
                              toolCallId: string;
                              toolName: string;
                              type: "tool-call";
                            }
                        >;
                    experimental_providerMetadata?: Record<string, any>;
                    providerOptions?: Record<string, any>;
                    role: "assistant";
                  }
                | {
                    content: Array<{
                      args?: any;
                      experimental_content?: Array<
                        | { text: string; type: "text" }
                        | { data: string; mimeType?: string; type: "image" }
                      >;
                      experimental_providerMetadata?: Record<string, any>;
                      isError?: boolean;
                      providerOptions?: Record<string, any>;
                      result: any;
                      toolCallId: string;
                      toolName: string;
                      type: "tool-result";
                    }>;
                    experimental_providerMetadata?: Record<string, any>;
                    providerOptions?: Record<string, any>;
                    role: "tool";
                  }
                | {
                    content: string;
                    experimental_providerMetadata?: Record<string, any>;
                    providerOptions?: Record<string, any>;
                    role: "system";
                  };
              model?: string;
              provider?: string;
              providerMetadata?: Record<string, Record<string, any>>;
              reasoning?: string;
              sources?: Array<{
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                url: string;
              }>;
              text?: string;
              usage?: {
                completionTokens: number;
                promptTokens: number;
                totalTokens: number;
              };
              warnings?: Array<
                | {
                    details?: string;
                    setting: string;
                    type: "unsupported-setting";
                  }
                | { details?: string; tool: any; type: "unsupported-tool" }
                | { message: string; type: "other" }
              >;
            }>;
            step: {
              experimental_providerMetadata?: Record<string, any>;
              files?: Array<any>;
              finishReason:
                | "stop"
                | "length"
                | "content-filter"
                | "tool-calls"
                | "error"
                | "other"
                | "unknown";
              isContinued: boolean;
              logprobs?: any;
              providerMetadata?: Record<string, Record<string, any>>;
              providerOptions?: Record<string, any>;
              reasoning?: string;
              reasoningDetails?: Array<any>;
              request?: {
                body?: any;
                headers?: Record<string, string>;
                method?: string;
                url?: string;
              };
              response?: {
                body?: any;
                headers?: Record<string, string>;
                id: string;
                messages: Array<{
                  fileId?: string;
                  id?: string;
                  message:
                    | {
                        content:
                          | string
                          | Array<
                              | {
                                  experimental_providerMetadata?: Record<
                                    string,
                                    any
                                  >;
                                  providerOptions?: Record<string, any>;
                                  text: string;
                                  type: "text";
                                }
                              | {
                                  experimental_providerMetadata?: Record<
                                    string,
                                    any
                                  >;
                                  image: string | ArrayBuffer;
                                  mimeType?: string;
                                  providerOptions?: Record<string, any>;
                                  type: "image";
                                }
                              | {
                                  data: string | ArrayBuffer;
                                  experimental_providerMetadata?: Record<
                                    string,
                                    any
                                  >;
                                  mimeType: string;
                                  providerOptions?: Record<string, any>;
                                  type: "file";
                                }
                            >;
                        experimental_providerMetadata?: Record<string, any>;
                        providerOptions?: Record<string, any>;
                        role: "user";
                      }
                    | {
                        content:
                          | string
                          | Array<
                              | {
                                  experimental_providerMetadata?: Record<
                                    string,
                                    any
                                  >;
                                  providerOptions?: Record<string, any>;
                                  text: string;
                                  type: "text";
                                }
                              | {
                                  data: string | ArrayBuffer;
                                  experimental_providerMetadata?: Record<
                                    string,
                                    any
                                  >;
                                  mimeType: string;
                                  providerOptions?: Record<string, any>;
                                  type: "file";
                                }
                              | {
                                  experimental_providerMetadata?: Record<
                                    string,
                                    any
                                  >;
                                  providerOptions?: Record<string, any>;
                                  text: string;
                                  type: "reasoning";
                                }
                              | {
                                  data: string;
                                  experimental_providerMetadata?: Record<
                                    string,
                                    any
                                  >;
                                  providerOptions?: Record<string, any>;
                                  type: "redacted-reasoning";
                                }
                              | {
                                  args: any;
                                  experimental_providerMetadata?: Record<
                                    string,
                                    any
                                  >;
                                  providerOptions?: Record<string, any>;
                                  toolCallId: string;
                                  toolName: string;
                                  type: "tool-call";
                                }
                            >;
                        experimental_providerMetadata?: Record<string, any>;
                        providerOptions?: Record<string, any>;
                        role: "assistant";
                      }
                    | {
                        content: Array<{
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          experimental_providerMetadata?: Record<string, any>;
                          isError?: boolean;
                          providerOptions?: Record<string, any>;
                          result: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }>;
                        experimental_providerMetadata?: Record<string, any>;
                        providerOptions?: Record<string, any>;
                        role: "tool";
                      }
                    | {
                        content: string;
                        experimental_providerMetadata?: Record<string, any>;
                        providerOptions?: Record<string, any>;
                        role: "system";
                      };
                }>;
                modelId: string;
                timestamp: number;
              };
              sources?: Array<{
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                url: string;
              }>;
              stepType: "initial" | "continue" | "tool-result";
              text: string;
              toolCalls: Array<{
                args: any;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                toolCallId: string;
                toolName: string;
                type: "tool-call";
              }>;
              toolResults: Array<{
                args?: any;
                experimental_content?: Array<
                  | { text: string; type: "text" }
                  | { data: string; mimeType?: string; type: "image" }
                >;
                experimental_providerMetadata?: Record<string, any>;
                isError?: boolean;
                providerOptions?: Record<string, any>;
                result: any;
                toolCallId: string;
                toolName: string;
                type: "tool-result";
              }>;
              usage?: {
                completionTokens: number;
                promptTokens: number;
                totalTokens: number;
              };
              warnings?: Array<
                | {
                    details?: string;
                    setting: string;
                    type: "unsupported-setting";
                  }
                | { details?: string; tool: any; type: "unsupported-tool" }
                | { message: string; type: "other" }
              >;
            };
          };
          threadId: string;
          userId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          order: number;
          parentMessageId: string;
          status: "pending" | "success" | "failed";
          step: {
            experimental_providerMetadata?: Record<string, any>;
            files?: Array<any>;
            finishReason:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            isContinued: boolean;
            logprobs?: any;
            providerMetadata?: Record<string, Record<string, any>>;
            providerOptions?: Record<string, any>;
            reasoning?: string;
            reasoningDetails?: Array<any>;
            request?: {
              body?: any;
              headers?: Record<string, string>;
              method?: string;
              url?: string;
            };
            response?: {
              body?: any;
              headers?: Record<string, string>;
              id: string;
              messages: Array<{
                fileId?: string;
                id?: string;
                message:
                  | {
                      content:
                        | string
                        | Array<
                            | {
                                experimental_providerMetadata?: Record<
                                  string,
                                  any
                                >;
                                providerOptions?: Record<string, any>;
                                text: string;
                                type: "text";
                              }
                            | {
                                experimental_providerMetadata?: Record<
                                  string,
                                  any
                                >;
                                image: string | ArrayBuffer;
                                mimeType?: string;
                                providerOptions?: Record<string, any>;
                                type: "image";
                              }
                            | {
                                data: string | ArrayBuffer;
                                experimental_providerMetadata?: Record<
                                  string,
                                  any
                                >;
                                mimeType: string;
                                providerOptions?: Record<string, any>;
                                type: "file";
                              }
                          >;
                      experimental_providerMetadata?: Record<string, any>;
                      providerOptions?: Record<string, any>;
                      role: "user";
                    }
                  | {
                      content:
                        | string
                        | Array<
                            | {
                                experimental_providerMetadata?: Record<
                                  string,
                                  any
                                >;
                                providerOptions?: Record<string, any>;
                                text: string;
                                type: "text";
                              }
                            | {
                                data: string | ArrayBuffer;
                                experimental_providerMetadata?: Record<
                                  string,
                                  any
                                >;
                                mimeType: string;
                                providerOptions?: Record<string, any>;
                                type: "file";
                              }
                            | {
                                experimental_providerMetadata?: Record<
                                  string,
                                  any
                                >;
                                providerOptions?: Record<string, any>;
                                text: string;
                                type: "reasoning";
                              }
                            | {
                                data: string;
                                experimental_providerMetadata?: Record<
                                  string,
                                  any
                                >;
                                providerOptions?: Record<string, any>;
                                type: "redacted-reasoning";
                              }
                            | {
                                args: any;
                                experimental_providerMetadata?: Record<
                                  string,
                                  any
                                >;
                                providerOptions?: Record<string, any>;
                                toolCallId: string;
                                toolName: string;
                                type: "tool-call";
                              }
                          >;
                      experimental_providerMetadata?: Record<string, any>;
                      providerOptions?: Record<string, any>;
                      role: "assistant";
                    }
                  | {
                      content: Array<{
                        args?: any;
                        experimental_content?: Array<
                          | { text: string; type: "text" }
                          | { data: string; mimeType?: string; type: "image" }
                        >;
                        experimental_providerMetadata?: Record<string, any>;
                        isError?: boolean;
                        providerOptions?: Record<string, any>;
                        result: any;
                        toolCallId: string;
                        toolName: string;
                        type: "tool-result";
                      }>;
                      experimental_providerMetadata?: Record<string, any>;
                      providerOptions?: Record<string, any>;
                      role: "tool";
                    }
                  | {
                      content: string;
                      experimental_providerMetadata?: Record<string, any>;
                      providerOptions?: Record<string, any>;
                      role: "system";
                    };
              }>;
              modelId: string;
              timestamp: number;
            };
            sources?: Array<{
              id: string;
              providerMetadata?: Record<string, Record<string, any>>;
              sourceType: "url";
              title?: string;
              url: string;
            }>;
            stepType: "initial" | "continue" | "tool-result";
            text: string;
            toolCalls: Array<{
              args: any;
              experimental_providerMetadata?: Record<string, any>;
              providerOptions?: Record<string, any>;
              toolCallId: string;
              toolName: string;
              type: "tool-call";
            }>;
            toolResults: Array<{
              args?: any;
              experimental_content?: Array<
                | { text: string; type: "text" }
                | { data: string; mimeType?: string; type: "image" }
              >;
              experimental_providerMetadata?: Record<string, any>;
              isError?: boolean;
              providerOptions?: Record<string, any>;
              result: any;
              toolCallId: string;
              toolName: string;
              type: "tool-result";
            }>;
            usage?: {
              completionTokens: number;
              promptTokens: number;
              totalTokens: number;
            };
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          };
          stepOrder: number;
          threadId: string;
        }>
      >;
      commitMessage: FunctionReference<
        "mutation",
        "internal",
        { messageId: string },
        null
      >;
      createThread: FunctionReference<
        "mutation",
        "internal",
        {
          defaultSystemPrompt?: string;
          parentThreadIds?: Array<string>;
          summary?: string;
          title?: string;
          userId?: string;
        },
        {
          _creationTime: number;
          _id: string;
          defaultSystemPrompt?: string;
          order?: number;
          parentThreadIds?: Array<string>;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }
      >;
      deleteAllForThreadIdAsync: FunctionReference<
        "mutation",
        "internal",
        { cursor?: string; limit?: number; threadId: string },
        { cursor: string; isDone: boolean }
      >;
      deleteAllForThreadIdSync: FunctionReference<
        "action",
        "internal",
        { cursor?: string; limit?: number; threadId: string },
        { cursor: string; isDone: boolean }
      >;
      deleteAllForUserId: FunctionReference<
        "action",
        "internal",
        { userId: string },
        null
      >;
      deleteAllForUserIdAsync: FunctionReference<
        "mutation",
        "internal",
        { userId: string },
        boolean
      >;
      getFilesToDelete: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit?: number },
        {
          continueCursor: string;
          files: Array<{
            _creationTime: number;
            _id: string;
            hash: string;
            refcount: number;
            storageId: string;
          }>;
          isDone: boolean;
        }
      >;
      getThread: FunctionReference<
        "query",
        "internal",
        { threadId: string },
        {
          _creationTime: number;
          _id: string;
          defaultSystemPrompt?: string;
          order?: number;
          parentThreadIds?: Array<string>;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        } | null
      >;
      getThreadMessages: FunctionReference<
        "query",
        "internal",
        {
          isTool?: boolean;
          order?: "asc" | "desc";
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          parentMessageId?: string;
          statuses?: Array<"pending" | "success" | "failed">;
          threadId: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            agentName?: string;
            embeddingId?:
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string;
            error?: string;
            fileId?: string;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            id?: string;
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "text";
                          }
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<string, any>;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            experimental_providerMetadata?: Record<string, any>;
                            mimeType: string;
                            providerOptions?: Record<string, any>;
                            type: "file";
                          }
                      >;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            experimental_providerMetadata?: Record<string, any>;
                            mimeType: string;
                            providerOptions?: Record<string, any>;
                            type: "file";
                          }
                        | {
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            experimental_providerMetadata?: Record<string, any>;
                            providerOptions?: Record<string, any>;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                      >;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    experimental_providerMetadata?: Record<string, any>;
                    isError?: boolean;
                    providerOptions?: Record<string, any>;
                    result: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "tool";
                }
              | {
                  content: string;
                  experimental_providerMetadata?: Record<string, any>;
                  providerOptions?: Record<string, any>;
                  role: "system";
                };
            model?: string;
            order: number;
            parentMessageId?: string;
            provider?: string;
            providerMetadata?: Record<string, any>;
            reasoning?: string;
            sources?: Array<{
              id: string;
              providerMetadata?: Record<string, Record<string, any>>;
              sourceType: "url";
              title?: string;
              url: string;
            }>;
            status: "pending" | "success" | "failed";
            stepId?: string;
            stepOrder: number;
            text?: string;
            threadId: string;
            tool: boolean;
            usage?: {
              completionTokens: number;
              promptTokens: number;
              totalTokens: number;
            };
            userId?: string;
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      getThreadsByUserId: FunctionReference<
        "query",
        "internal",
        {
          order?: "asc" | "desc";
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          userId: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            defaultSystemPrompt?: string;
            order?: number;
            parentThreadIds?: Array<string>;
            status: "active" | "archived";
            summary?: string;
            title?: string;
            userId?: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      rollbackMessage: FunctionReference<
        "mutation",
        "internal",
        { error?: string; messageId: string },
        null
      >;
      searchMessages: FunctionReference<
        "action",
        "internal",
        {
          limit: number;
          messageRange?: { after: number; before: number };
          parentMessageId?: string;
          text?: string;
          threadId?: string;
          userId?: string;
          vector?: Array<number>;
          vectorModel?: string;
          vectorScoreThreshold?: number;
        },
        Array<{
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?:
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string;
          error?: string;
          fileId?: string;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          text: string;
                          type: "text";
                        }
                      | {
                          experimental_providerMetadata?: Record<string, any>;
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, any>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          experimental_providerMetadata?: Record<string, any>;
                          mimeType: string;
                          providerOptions?: Record<string, any>;
                          type: "file";
                        }
                    >;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          experimental_providerMetadata?: Record<string, any>;
                          mimeType: string;
                          providerOptions?: Record<string, any>;
                          type: "file";
                        }
                      | {
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                    >;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  experimental_providerMetadata?: Record<string, any>;
                  isError?: boolean;
                  providerOptions?: Record<string, any>;
                  result: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                role: "tool";
              }
            | {
                content: string;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                role: "system";
              };
          model?: string;
          order: number;
          parentMessageId?: string;
          provider?: string;
          providerMetadata?: Record<string, any>;
          reasoning?: string;
          sources?: Array<{
            id: string;
            providerMetadata?: Record<string, Record<string, any>>;
            sourceType: "url";
            title?: string;
            url: string;
          }>;
          status: "pending" | "success" | "failed";
          stepId?: string;
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            completionTokens: number;
            promptTokens: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }>
      >;
      textSearch: FunctionReference<
        "query",
        "internal",
        { limit: number; text: string; threadId?: string; userId?: string },
        Array<{
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?:
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string;
          error?: string;
          fileId?: string;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          text: string;
                          type: "text";
                        }
                      | {
                          experimental_providerMetadata?: Record<string, any>;
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, any>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          experimental_providerMetadata?: Record<string, any>;
                          mimeType: string;
                          providerOptions?: Record<string, any>;
                          type: "file";
                        }
                    >;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          experimental_providerMetadata?: Record<string, any>;
                          mimeType: string;
                          providerOptions?: Record<string, any>;
                          type: "file";
                        }
                      | {
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          experimental_providerMetadata?: Record<string, any>;
                          providerOptions?: Record<string, any>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                    >;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  experimental_providerMetadata?: Record<string, any>;
                  isError?: boolean;
                  providerOptions?: Record<string, any>;
                  result: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                role: "tool";
              }
            | {
                content: string;
                experimental_providerMetadata?: Record<string, any>;
                providerOptions?: Record<string, any>;
                role: "system";
              };
          model?: string;
          order: number;
          parentMessageId?: string;
          provider?: string;
          providerMetadata?: Record<string, any>;
          reasoning?: string;
          sources?: Array<{
            id: string;
            providerMetadata?: Record<string, Record<string, any>>;
            sourceType: "url";
            title?: string;
            url: string;
          }>;
          status: "pending" | "success" | "failed";
          stepId?: string;
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            completionTokens: number;
            promptTokens: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }>
      >;
      updateThread: FunctionReference<
        "mutation",
        "internal",
        {
          patch: {
            defaultSystemPrompt?: string;
            status?: "active" | "archived";
            summary?: string;
            title?: string;
          };
          threadId: string;
        },
        {
          _creationTime: number;
          _id: string;
          defaultSystemPrompt?: string;
          order?: number;
          parentThreadIds?: Array<string>;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }
      >;
    };
    vector: {
      index: {
        deleteBatch: FunctionReference<
          "mutation",
          "internal",
          {
            ids: Array<
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
            >;
          },
          null
        >;
        deleteBatchForThread: FunctionReference<
          "mutation",
          "internal",
          {
            cursor?: string;
            limit: number;
            model: string;
            threadId: string;
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1536
              | 2048
              | 3072
              | 4096;
          },
          { continueCursor: string; isDone: boolean }
        >;
        insertBatch: FunctionReference<
          "mutation",
          "internal",
          {
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1536
              | 2048
              | 3072
              | 4096;
            vectors: Array<{
              model: string;
              table: string;
              threadId?: string;
              userId?: string;
              vector: Array<number>;
            }>;
          },
          null
        >;
        paginate: FunctionReference<
          "query",
          "internal",
          {
            cursor?: string;
            limit: number;
            table?: string;
            targetModel: string;
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1536
              | 2048
              | 3072
              | 4096;
          },
          {
            continueCursor: string;
            ids: Array<
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
            >;
            isDone: boolean;
          }
        >;
        updateBatch: FunctionReference<
          "mutation",
          "internal",
          {
            vectors: Array<{
              id:
                | string
                | string
                | string
                | string
                | string
                | string
                | string
                | string
                | string;
              model: string;
              vector: Array<number>;
            }>;
          },
          null
        >;
      };
    };
  };
};
