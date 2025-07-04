import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

class LangChainService {
  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateConversationalResponse(step, userData) {
    const responseTemplate = PromptTemplate.fromTemplate(`
      You are an AI marketing assistant helping a user build their campaign.
      Current step: {step}
      User data so far: {userData}
      
      Generate a friendly, encouraging response that:
      1. Acknowledges their input
      2. Provides relevant insights
      3. Builds excitement for the next step
      
      Keep it conversational and under 50 words.
      
      Response:
    `);

    const chain = new LLMChain({
      llm: this.llm,
      prompt: responseTemplate,
    });

    const result = await chain.call({
      step: step,
      userData: JSON.stringify(userData),
    });

    return result.text;
  }

  async generateCampaignStrategy(campaignData) {
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        strategy: z.string().describe("Overall campaign strategy"),
        budgetAllocation: z.object({
          facebook: z.number(),
          instagram: z.number(),
          linkedin: z.number(),
          googleAds: z.number(),
          twitter: z.number(),
        }),
        adCopy: z.array(z.object({
          platform: z.string(),
          headline: z.string(),
          description: z.string(),
          cta: z.string(),
        })),
        targetingRecommendations: z.object({
          demographics: z.string(),
          interests: z.array(z.string()),
          behaviors: z.array(z.string()),
        }),
        kpis: z.array(z.string()),
        timeline: z.string(),
      })
    );

    const formatInstructions = parser.getFormatInstructions();

    const campaignTemplate = PromptTemplate.fromTemplate(`
      Create a comprehensive marketing campaign strategy based on:
      
      Business: {businessName} in {industry}
      Size: {businessSize}
      Goals: {goals}
      Budget: {budget}
      Target Audience: {targetAudience}
      Preferred Channels: {preferredChannels}
      Timeline: {timeline}
      
      Generate a data-driven strategy with:
      1. Smart budget allocation across platforms
      2. Platform-specific ad copy
      3. Precise targeting recommendations
      4. Measurable KPIs
      5. Implementation timeline
      
      {format_instructions}
    `);

    const chain = new LLMChain({
      llm: this.llm,
      prompt: campaignTemplate,
    });

    const result = await chain.call({
      ...campaignData,
      goals: campaignData.goals.join(', '),
      preferredChannels: campaignData.preferredChannels.join(', '),
      format_instructions: formatInstructions,
    });

    return parser.parse(result.text);
  }

  async optimizeBudgetAllocation(campaignData, performanceData) {
    const optimizationTemplate = PromptTemplate.fromTemplate(`
      Analyze campaign performance and optimize budget allocation:
      
      Current allocation: {currentAllocation}
      Performance data: {performanceData}
      Total budget: {totalBudget}
      
      Recommend new budget distribution to maximize ROI.
      Consider:
      - Cost per acquisition by platform
      - Conversion rates
      - Audience engagement
      - Platform-specific trends
      
      Return optimized allocation as JSON.
    `);

    const chain = new LLMChain({
      llm: this.llm,
      prompt: optimizationTemplate,
    });

    const result = await chain.call({
      currentAllocation: JSON.stringify(campaignData.budgetAllocation),
      performanceData: JSON.stringify(performanceData),
      totalBudget: campaignData.budget,
    });

    return JSON.parse(result.text);
  }
}

export default new LangChainService();