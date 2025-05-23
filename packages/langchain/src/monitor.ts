import { LLMonitor, LLMonitorConfig } from "@llmonitor/sdk";
import { LLMonitorCallbackHandler } from "./callback";

export class LangChainMonitor {
  private monitor: LLMonitor;
  private callbackHandler: LLMonitorCallbackHandler;

  constructor(config: LLMonitorConfig) {
    this.monitor = new LLMonitor(config);
    this.callbackHandler = new LLMonitorCallbackHandler(this.monitor);
  }

  wrapLLM(llm: any): any {
    const originalCall = llm.call || llm._call;

    if (!originalCall) {
      console.warn("[LLMonitor] LLM does not have a call method to wrap");
      return llm;
    }

    const wrappedLLM = Object.create(Object.getPrototypeOf(llm));
    Object.assign(wrappedLLM, llm);

    wrappedLLM.callbacks = [this.callbackHandler, ...(llm.callbacks || [])];

    return wrappedLLM;
  }

  wrapChain(chain: any): any {
    const originalCall = chain.call || chain._call;

    if (!originalCall) {
      console.warn("[LLMonitor] Chain does not have a call method to wrap");
      return chain;
    }

    const wrappedChain = Object.create(Object.getPrototypeOf(chain));
    Object.assign(wrappedChain, chain);

    wrappedChain.callbacks = [this.callbackHandler, ...(chain.callbacks || [])];

    return wrappedChain;
  }

  createCallbackHandler(): LLMonitorCallbackHandler {
    return this.callbackHandler;
  }

  async flush(): Promise<void> {
    return this.monitor.flush();
  }
}
