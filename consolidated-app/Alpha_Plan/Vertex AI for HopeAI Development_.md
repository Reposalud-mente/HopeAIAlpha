# **Utilizing Google Cloud Vertex AI for Advanced LLM Solutions in Telehealth: A Practical Guide for HopeAI (April 2025\)**

## **I. Introduction: Leveraging Vertex AI for HopeAI's Telehealth Vision**

### **A. Overview of Vertex AI for Advanced LLM Solutions**

Google Cloud's Vertex AI stands as a unified, comprehensive platform designed for the end-to-end development, deployment, and management of machine learning (ML) models, including sophisticated Large Language Models (LLMs).1 It provides a robust environment tailored for building enterprise-grade AI applications that demand scalability, robust security measures, and integrated MLOps capabilities.1 For projects like HopeAI's telehealth initiative, Vertex AI offers a suite of powerful components, including the Model Garden for accessing foundation models, Generative AI Studio for rapid prototyping, the specialized RAG Engine and Agent Builder for advanced applications, Vertex AI Evaluation Service for performance assessment, Vertex AI Pipelines for workflow orchestration, and comprehensive SDKs for programmatic control.1 The platform's architecture facilitates rapid innovation by providing access to cutting-edge models and tools.4

The rapid evolution of Vertex AI, particularly in its generative AI and agent-building capabilities, is evident from the frequent updates and feature releases observed around April 2025\.5 This dynamic landscape underscores the need for development teams like HopeAI's to adopt agile methodologies. A static development plan may quickly become outdated. Therefore, prioritizing modular design, continuous learning, and the ability to integrate new features—whether in Preview or General Availability (GA)—will be crucial for maximizing the platform's potential.

### **B. Relevance to HopeAI's Clinical-Psychological Context**

The capabilities of LLMs, particularly when enhanced with Retrieval Augmented Generation (RAG) and deployed within autonomous agents, hold significant promise for transforming telehealth services like those envisioned by HopeAI. Potential applications include empowering clinicians with rapid, context-aware access to patient history or relevant medical literature, automating the summarization of patient interactions to reduce administrative burden, assisting with scheduling, or even providing preliminary information gathering under strict protocols.7 However, applying AI in clinical and psychological domains necessitates navigating unique challenges. The paramount importance of accuracy, reliability, patient safety, and data privacy cannot be overstated.10 This guide will address these considerations throughout the implementation process.

### **C. Focus on April 2025 Capabilities and Responsible AI**

This report reflects the state-of-the-art features and capabilities of Vertex AI as of April 2025\. This includes recent advancements such as the availability of powerful new foundation models like Google's Gemini 2.5 series and Meta's Llama 4 in the Model Garden, the introduction of the Agent Development Kit (ADK) and Agent Engine for building and deploying sophisticated AI agents, and enhancements to RAG and grounding capabilities.5 Critically, this guide embeds the principles of Responsible AI development at every stage. Given the sensitive nature of clinical-psychological applications, careful attention will be paid to data privacy (including HIPAA compliance considerations), the configuration and understanding of safety filters, strategies for bias awareness, and the implementation of human oversight mechanisms.11

### **D. Report Objectives and Structure**

The primary objective of this document is to serve as a comprehensive, practical, and step-by-step guide for the technical team at HopeAI. It details how to effectively utilize the Vertex AI platform to develop and deploy advanced LLM-based solutions, specifically focusing on RAG systems and autonomous AI agents tailored for the telehealth domain. The report is structured to guide the team through foundational setup, understanding core components, implementing RAG and agent workflows, managing the MLOps lifecycle including evaluation and iteration, addressing responsible AI considerations, managing costs, and finally, offering concluding recommendations.

## **II. Foundational Setup: Preparing the Vertex AI Environment**

### **A. Project Configuration and API Enablement**

The initial step involves setting up the Google Cloud environment. This requires either creating a new Google Cloud project or selecting an existing one dedicated to the HopeAI initiative.16 Project creation can be done via the Google Cloud console. Once a project is selected, it is essential to ensure that billing is enabled for the project, as most Vertex AI services incur costs.16

Next, the necessary Application Programming Interfaces (APIs) must be enabled within the project. The core API is the Vertex AI API itself. Depending on the specific data sources and integrations planned (e.g., using clinical data stored in Cloud Storage or BigQuery), additional APIs such as the Cloud Storage API or BigQuery API might also need to be enabled.17 A convenient option within the Vertex AI dashboard is to "Enable All Recommended APIs," which simplifies this process.18

### **B. Authentication for Development (SDK/IDE Focus)**

For developers working locally within an Integrated Development Environment (IDE), the standard and recommended method for authenticating to Vertex AI services is through Application Default Credentials (ADC). This is typically configured by installing the Google Cloud CLI (gcloud) and running the command gcloud auth application-default login.16 This command initiates a web-based authentication flow that grants the SDK access to Google Cloud resources based on the user's permissions. It is important to note that Vertex AI primarily uses Identity and Access Management (IAM) for access control, rather than API keys often used with other services.20

Appropriate IAM roles must be granted to the users or service accounts interacting with Vertex AI. The roles/aiplatform.user (Vertex AI User) role grants access to most common capabilities, while roles/aiplatform.admin provides full control.17 If using Vertex AI Workbench notebooks, the roles/notebooks.admin and roles/iam.serviceAccountUser roles may also be required.17 For production deployments or automated tasks like model tuning pipelines, dedicated service accounts with specific, minimized permissions should be created and used.5 Proper authentication and IAM configuration are crucial first steps, particularly when dealing with potentially sensitive clinical data, to ensure security and compliance.

### **C. Overview of Key Vertex AI Tools (Console vs. SDK Trade-offs)**

Vertex AI offers multiple interfaces for interaction, primarily the web-based Google Cloud Console (including Generative AI Studio) and programmatic Software Development Kits (SDKs), predominantly Python. Understanding the strengths and use cases of each is vital for an efficient workflow.

* Vertex AI Console (and Generative AI Studio):  
  The Console provides a graphical user interface (GUI) for managing Vertex AI resources. Generative AI Studio, accessible within the Console, is specifically designed for exploring, prototyping, and testing generative models.2 Key activities suited for the Console/Studio include:  
  * **Model Discovery:** Browsing and experimenting with models in the Model Garden.2  
  * **Prompt Prototyping:** Quickly testing different prompts, adjusting parameters like temperature and token limits, using prompt templates, and visually comparing responses (side-by-side comparison for up to 3 prompts is noted 5) in the Prompt Gallery.25  
  * **No-Code/Low-Code Tasks:** Utilizing AutoML for training models without extensive coding.27  
  * **Visual Monitoring:** Observing deployed model performance and resource usage.27  
  * **Pros:** The visual interface is user-friendly, especially for exploration and initial testing. It allows for rapid prototyping without requiring deep coding knowledge.27  
  * **Cons:** It is less suitable for automating complex workflows, offers limited customization compared to the SDK, and may not be efficient for repetitive tasks or sophisticated RAG/agent development.27  
* Vertex AI SDKs (Python Focus):  
  The Vertex AI SDK for Python provides programmatic access to the Vertex AI API, enabling automation and integration into custom applications and MLOps pipelines.27 It is the preferred tool for:  
  * **Complex Development:** Building sophisticated RAG systems and autonomous agents requiring fine-grained control.1  
  * **Automation:** Scripting workflows for data preprocessing, model tuning, evaluation, deployment, and knowledge base updates.27  
  * **Integration:** Embedding Vertex AI capabilities directly into the HopeAI telehealth platform backend.  
  * **MLOps:** Implementing reproducible and scalable machine learning operations.32  
  * **IDE Integration:** The SDK integrates seamlessly with standard Python development environments like VS Code or PyCharm, leveraging familiar coding tools and practices.20 The gcloud CLI complements the SDK for certain configuration and deployment tasks.16  
  * **Pros:** Enables automation, offers maximum flexibility and control, essential for complex RAG/agent logic, facilitates robust MLOps practices, and integrates with standard development workflows.27  
  * **Cons:** Requires Python programming expertise and involves a steeper initial learning curve compared to the Console.27  
* Recommendation for HopeAI:  
  Given the complexity and customization required for building a clinical RAG system and autonomous agents, the Vertex AI SDK for Python should be the primary development tool for the HopeAI team. It provides the necessary control, automation capabilities, and integration potential. The Google Cloud Console and Generative AI Studio should serve as complementary tools for initial model exploration, rapid prompt prototyping, discovering available features in Model Garden, and visual monitoring of resources and deployed models. This blended approach allows developers to leverage the strengths of each interface: quickly validating ideas in the Studio before implementing robust, automated solutions with the SDK.

## **III. Core Components: Models and Knowledge Base**

### **A. Selecting Foundation Models from Model Garden (April 2025\)**

Vertex AI Model Garden serves as a centralized library for discovering, evaluating, customizing, and deploying a wide array of foundation models from Google and third-party partners.5 As of April 2025, several models relevant to HopeAI's clinical RAG and agent requirements are available 37:

* **Google Gemini Family:**  
  * **Gemini 2.5 Pro & Flash (Preview):** These models represent the cutting edge, offering enhanced reasoning ("thinking") capabilities, multimodal understanding (text, image, audio, video, code), and an exceptionally large 2,000,000-token context window.1 Gemini 2.5 Pro is positioned for complex tasks, while 2.5 Flash balances performance and cost.37 Their advanced reasoning and large context could be highly beneficial for complex clinical query understanding and agentic tasks. Note that as of late April 2025, access might be restricted in new projects without prior usage.5  
  * **Gemini 2.0 Flash & Flash-Lite (GA):** These are considered workhorse models, optimized for performance and cost-efficiency.37 Gemini 2.0 Flash supports the real-time Live API and offers supervised tuning, including for function calling.5 These could be suitable for high-throughput tasks or initial RAG implementations.  
* **Meta Llama Family:**  
  * **Llama 4 Maverick & Scout (GA via MaaS / Preview via API):** The latest generation from Meta, featuring multimodal capabilities and an efficient Mixture-of-Experts (MoE) architecture.5 Maverick is the most capable for reasoning and complex tasks, while Scout offers efficiency.39 Available as fully managed API endpoints (MaaS) for simplified deployment.5  
  * **Llama 3.x (GA/Preview):** Earlier versions remain available, with established support for fine-tuning within Vertex AI.5  
* **Healthcare-Specific Models:**  
  * **MedLM (Medium & Large):** Foundation models specifically fine-tuned by Google for medical question answering and summarization tasks.40 Accessed via a dedicated API.40 These are prime candidates for HopeAI's core clinical RAG functionality but may require specific access agreements.  
* **Other Partner Models:**  
  * **Anthropic Claude 3.x Family (Sonnet, Haiku, Opus):** Available via managed APIs in Vertex AI, known for strong performance in various tasks, including coding and reasoning.1

Model Selection Factors:  
The choice of foundation model(s) depends critically on HopeAI's specific requirements:

* **Task:** Is the primary need clinical QA (favoring MedLM, Gemini Pro), summarization (MedLM, Gemini), or complex agent control requiring advanced reasoning (Gemini 2.5 Pro, Llama 4 Maverick, Claude 3 Opus)?  
* **Modality:** Does the application need to process only text, or also clinical images, diagrams, or audio notes (favoring multimodal models like Gemini, Llama 4)? Vertex AI Search for Healthcare also has enhanced multimodal capabilities.9  
* **Performance:** Latency and throughput needs will influence the choice between larger models (potentially higher latency) and smaller/Flash variants (lower latency).9  
* **Cost:** Pricing varies significantly based on model size, input/output type (tokens/characters/media), and context length.44 This must be balanced against performance (See Section VIII).  
* **Customization:** Does HopeAI require fine-tuning on proprietary clinical data? Check model-specific tuning support (e.g., Gemini 2.0 Flash, Llama 3.x).5  
* **Licensing:** Open models (like Llama) have specific license terms that must be reviewed and accepted.36

**Table 1: Comparison of Relevant Foundation Models (as of April 2025\)**

| Model Name (Version) | Provider | Availability (API/MaaS) | Key Capabilities | Suitability for HopeAI | Fine-Tuning Support | Pricing Basis |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Gemini 2.5 Pro (Preview) | Google | Preview (API) | 2M tokens, Multimodal, Advanced Reasoning, Function Calling, Thinking | Complex Clinical QA, Agent Control | Likely (Preview) | Tokens (Tiered by Context) |
| Gemini 2.5 Flash (Preview) | Google | Preview (API) | 2M tokens, Multimodal, Reasoning, Function Calling, Thinking, Speed/Cost Balance | General Clinical Tasks, RAG, Agents | Likely (Preview) | Tokens (Tiered by Modality/Thinking) |
| Gemini 2.0 Flash (GA) | Google | GA (API, Live API) | Multimodal, Function Calling, Speed/Cost Optimized | High-throughput RAG, Summarization, Basic Agents | Yes (Supervised, FC) | Tokens / Modality (Ref) |
| Llama 4 Maverick (GA/Prev) | Meta | GA (MaaS), Preview (API) | Multimodal, MoE, Reasoning, Complex Image Understanding | Complex RAG, Potential Agent Use | Via Self-hosting | Tokens (MaaS) |
| Llama 4 Scout (GA/Prev) | Meta | GA (MaaS), Preview (API) | Multimodal, MoE, Efficient | Efficient RAG | Via Self-hosting | Tokens (MaaS) |
| MedLM-large (GA) | Google | GA (MedLM API) | Text, Tuned for Medical QA & Summarization | Core Clinical QA & Summarization | Specific (Check Docs) | Characters/API Calls (Check Docs) |
| MedLM-medium (GA) | Google | GA (MedLM API) | Text, Tuned for Medical QA & Summarization | Core Clinical QA & Summarization | Specific (Check Docs) | Characters/API Calls (Check Docs) |
| Claude 3.x (GA/Preview) | Anthropic | GA/Preview (Partner API) | Text/Vision (Opus, Sonnet, Haiku), Strong Reasoning, Coding | Advanced QA, Summarization, Potential Agent Use | Yes (Check Docs) | Tokens (Partner Pricing) |

*(Note: Availability, features, and pricing are subject to change. Always consult the official Vertex AI documentation for the latest information. Model access might require specific agreements or approvals, especially for MedLM and partner models.)*

### **B. Building and Managing the Clinical Knowledge Base for RAG**

The effectiveness of any RAG system hinges on the quality and accessibility of its knowledge base. For HopeAI, this knowledge base will contain the curated clinical and psychological information used to ground the LLM's responses, ensuring accuracy and relevance.7

* Data Ingestion Strategies:  
  Vertex AI RAG Engine and Search support ingesting data from various sources, including Google Cloud Storage (GCS) buckets, Google Drive, and local file uploads.45 This flexibility allows HopeAI to incorporate documents in formats common in healthcare, such as PDFs (research papers, guidelines), text files (notes), and potentially structured data from sources like BigQuery if using Vertex AI Search.28 For complex document layouts (e.g., forms with tables and diagrams), the Document AI Layout Parser can be used to extract structured content before ingestion.49 Given the clinical context, careful consideration must be given to data provenance and ensuring only validated, reliable sources are included in the knowledge base.  
* Chunking and Metadata Best Practices:  
  Raw documents are typically too large to be processed directly by LLMs or embedding models. Therefore, they must be broken down into smaller, manageable "chunks".45 The strategy used for chunking significantly impacts retrieval effectiveness.51 Common approaches include fixed-size chunking with overlap (to maintain context across boundaries). Vertex AI RAG Engine allows configuration of chunk\_size and chunk\_overlap during file import.46 Experimentation is key to finding the optimal chunk size for clinical documents, balancing context preservation with retrieval precision.51  
  Equally important is enriching chunks with metadata.51 Adding metadata fields such as document\_id, source\_publication, publication\_date, clinical\_topic, patient\_id (if handled appropriately under HIPAA), or section\_title during ingestion enables powerful filtering capabilities during retrieval.52 This allows the RAG system to narrow down the search space to only the most relevant documents or sections based on the query context or user permissions.  
* Indexing with Vertex AI Search / Vector Search:  
  Once data is chunked and metadata is assigned, it needs to be indexed for efficient retrieval. Vertex AI offers two primary options that integrate with RAG Engine:  
  * **Vertex AI Search:** A fully managed service that simplifies indexing diverse data types and provides Google-quality search capabilities.7 It can handle both structured and unstructured data and offers features like filtering based on metadata.52 It serves as a straightforward backend option for RAG Engine.53  
  * **Vertex AI Vector Search:** A high-performance vector database optimized for low-latency semantic search over billions of items.55 It requires more setup (creating and deploying indexes and endpoints) but offers fine-grained control and potentially better performance for pure vector similarity searches.56 It also supports streaming updates for near real-time indexing.56 The choice depends on HopeAI's specific needs regarding data diversity, update frequency, performance requirements, and desired level of control.  
* Iterative Updates during Alpha Testing:  
  A clinical knowledge base is not static; it requires continuous updates as new research emerges, guidelines change, or testing reveals gaps.51 Vertex AI provides mechanisms for managing the knowledge base iteratively:  
  * **Vertex AI Search Data Stores:** Documents can be added, updated, or deleted programmatically using the Vertex AI Search API (part of the AI Applications API 28). Automation using Cloud Functions triggered by Pub/Sub messages upon document changes in GCS is a common pattern.52 Re-indexing might occur automatically or require specific API calls depending on the update method.  
  * **RAG Engine Corpus:** The RAG Engine API/SDK provides functions like rag.import\_files to add new documents.46 While direct update or delete functions for individual files within a corpus are less explicitly detailed in the available documentation 128, managing updates might involve re-importing files with the same identifier or potentially managing files via the underlying Vector Search or Vertex AI Search mechanisms if used as backends. Careful tracking of file versions and potentially periodic full re-indexing might be necessary during the Alpha phase.

The dynamic nature of clinical knowledge means that robust knowledge base management is critical for the long-term success and reliability of HopeAI's RAG system. The chosen indexing backend (Vertex AI Search or Vector Search) will influence the specific update mechanisms available, requiring HopeAI to establish clear curation, validation, and update processes early in the development cycle. Furthermore, the effectiveness of the RAG system is directly tied to the quality of data preparation; simply ingesting documents is insufficient. Significant effort should be dedicated to optimizing chunking strategies and metadata enrichment, guided by iterative testing and evaluation (discussed in Section VI).

## **IV. Implementing Retrieval Augmented Generation (RAG) on Vertex AI**

Retrieval Augmented Generation (RAG) is a technique that significantly enhances the capabilities of LLMs by connecting them to external, up-to-date knowledge sources.7 Instead of relying solely on the information embedded during training, RAG systems first retrieve relevant information from a specified knowledge base (like HopeAI's clinical database) and then use that information to "ground" the LLM's response, making it more accurate, factual, and contextually appropriate.7 This is particularly crucial in clinical settings to minimize the risk of hallucinations (generating incorrect information) and ensure responses are based on verified clinical data.7

### **A. Vertex AI RAG Architecture Options**

Vertex AI offers a spectrum of solutions for implementing RAG, catering to different levels of required customization and development effort.7

* **Vertex AI RAG Engine:** This is a managed orchestration service designed to streamline the entire RAG process.7 It handles the underlying complexities of data ingestion, chunking, embedding generation, indexing into a corpus, retrieving relevant chunks, and integrating the retrieved context with an LLM for generation.45 RAG Engine provides flexibility in choosing components, supporting various vector database backends including a built-in option (powered by Spanner), Vertex AI Search, Vertex AI Vector Search, and third-party databases like Pinecone and Weaviate.7 Its key advantage lies in accelerating development and reducing infrastructure management overhead, making it an excellent starting point for many RAG applications.7 While managed, it still offers customization points for chunking, embedding models, and retrieval parameters.50  
* **DIY RAG Components:** For maximum control and flexibility, developers can construct custom RAG pipelines by leveraging individual Vertex AI components and APIs.7 This involves programmatically handling each step:  
  * Using the **Text Embedding API** (or Multimodal Embedding API) to generate vector representations of data chunks.7  
  * Setting up and managing **Vertex AI Vector Search** (or another vector database) for indexing and querying embeddings.49  
  * Implementing retrieval logic, potentially enhanced by the **Ranking API** to re-order retrieved chunks based on relevance to the query, beyond simple semantic similarity.7  
  * Integrating the retrieved context with a chosen LLM (e.g., Gemini) via the **Generate Content API**, potentially using the **Grounding API** features.7  
  * This approach often involves using frameworks like LangChain or LlamaIndex to structure the pipeline.3 While offering complete control, this path requires significantly more development effort and responsibility for managing the underlying infrastructure.7  
* **Recommendation:** For HopeAI's Alpha phase, leveraging the **Vertex AI RAG Engine** is recommended. Its managed nature accelerates prototyping and deployment, while its support for Vertex AI Search or Vector Search as backends provides scalability and performance.7 The Vertex AI SDK offers sufficient control over corpus creation, data ingestion, and retrieval configuration for most initial needs.46 This approach strikes a good balance between ease of use and necessary customization. The platform's tiered offerings mean HopeAI can start with the managed service and potentially transition to a more DIY approach later if specific requirements necessitate greater control, without being locked into the initial choice.

### **B. Step-by-Step Guide: Building a RAG Pipeline with RAG Engine (SDK Focus)**

This guide outlines the process using the Vertex AI SDK for Python, integrating steps for using either Vertex AI Search or Vector Search as the backend.

1. **Setup:** Initialize the Vertex AI SDK, specifying your project ID and location.  
   Python  
   import vertexai  
   from vertexai import rag  
   from vertexai.generative\_models import GenerativeModel, Tool

   \# TODO: Replace with your project details  
   PROJECT\_ID \= "your-hopeai-project-id"  
   LOCATION \= "us-central1" \# Choose an appropriate region  
   GCS\_BUCKET\_URI \= "gs://your-hopeai-bucket" \# For staging

   vertexai.init(project=PROJECT\_ID, location=LOCATION, staging\_bucket=GCS\_BUCKET\_URI)

   46  
2. **Configure Backend:** Define the configuration for your chosen retrieval backend.  
   * *Option A: Using Vertex AI Search:*  
     Python  
     \# TODO: Replace with your Vertex AI Search engine resource name  
     \# Format: projects/{PROJECT\_ID}/locations/{LOCATION}/collections/default\_collection/engines/{ENGINE\_ID}  
     VERTEX\_AI\_SEARCH\_ENGINE\_NAME \= "your-search-engine-resource-name"

     vertex\_ai\_search\_config \= rag.VertexAiSearchConfig(  
         serving\_config=f"{VERTEX\_AI\_SEARCH\_ENGINE\_NAME}/servingConfigs/default\_search",  
     )  
     backend\_config \= vertex\_ai\_search\_config  
     53  
   * *Option B: Using Vertex AI Vector Search:* (Assumes index and endpoint are already created and deployed as per Section III.B)  
     Python  
     \# TODO: Replace with your Vector Search index and endpoint resource names  
     \# Format: projects/{PROJECT\_ID}/locations/{LOCATION}/indexes/{INDEX\_ID}  
     \# Format: projects/{PROJECT\_ID}/locations/{LOCATION}/indexEndpoints/{INDEX\_ENDPOINT\_ID}  
     INDEX\_RESOURCE\_NAME \= "your-vector-search-index-name"  
     INDEX\_ENDPOINT\_RESOURCE\_NAME \= "your-vector-search-endpoint-name"

     vector\_db\_config \= rag.VertexVectorSearch(  
         index=INDEX\_RESOURCE\_NAME,  
         index\_endpoint=INDEX\_ENDPOINT\_RESOURCE\_NAME  
     )  
     backend\_config \= rag.RagVectorDbConfig(vector\_db=vector\_db\_config)  
     56  
3. **Create RAG Corpus:** Create the corpus, linking it to the chosen backend and specifying an embedding model.  
   Python  
   \# TODO: Choose a display name for your corpus  
   CORPUS\_DISPLAY\_NAME \= "hopeai\_clinical\_knowledge\_base"

   \# Configure embedding model (e.g., text-embedding-005 or a newer version)  
   embedding\_model\_config \= rag.RagEmbeddingModelConfig(  
       vertex\_prediction\_endpoint=rag.VertexPredictionEndpoint(  
           publisher\_model="publishers/google/models/text-embedding-005" \# Or a newer model  
       )  
   )

   \# Create the corpus using the selected backend\_config  
   rag\_corpus \= rag.create\_corpus(  
       display\_name=CORPUS\_DISPLAY\_NAME,  
       \# Use vertex\_ai\_search\_config OR rag\_vector\_db\_config based on choice in Step 2  
       backend\_config=backend\_config,  
       \# Embedding model config is needed if using Vector Search backend  
       \# or the default RAG Engine backend. May not be needed if Search handles embeddings.  
       \# Consult latest docs if using Vertex AI Search backend.  
       \# rag\_embedding\_model\_config=embedding\_model\_config \# Include if needed  
   )  
   print(f"Created RAG Corpus: {rag\_corpus.name}")

   46  
4. **Ingest Data:** Import clinical documents from GCS or Google Drive into the corpus. Configure chunking parameters.  
   Python  
   \# TODO: Specify paths to your clinical documents in GCS or Google Drive  
   \# e.g., \["gs://your-hopeai-bucket/clinical\_docs/", "https://drive.google.com/drive/folders/your\_folder\_id"\]  
   DATA\_PATHS \= \["gs://your-hopeai-bucket/clinical\_data/"\]

   \# Configure chunking  
   chunking\_config \= rag.ChunkingConfig(  
       chunk\_size=512, \# Experiment with optimal size for clinical text  
       chunk\_overlap=100  
   )  
   transformation\_config \= rag.TransformationConfig(chunking\_config=chunking\_config)

   \# Import files (this is an async operation)  
   import\_operation \= rag.import\_files(  
       rag\_corpus.name,  
       DATA\_PATHS,  
       transformation\_config=transformation\_config,  
       max\_embedding\_requests\_per\_min=1000, \# Adjust based on quota  
   )  
   print(f"Import operation started: {import\_operation.operation.name}")  
   \# Optionally wait for completion: import\_operation.result()

   46  
5. **Configure Retrieval:** Define parameters for retrieving relevant chunks.  
   Python  
   rag\_retrieval\_config \= rag.RagRetrievalConfig(  
       top\_k=5, \# Retrieve top 5 most relevant chunks  
       \# Optional: Filter based on embedding distance (adjust threshold based on testing)  
       filter\=rag.Filter(vector\_distance\_threshold=0.5),  
   )

   46  
6. **Define RAG Resource:** Specify the corpus to be used for retrieval.  
   Python  
   rag\_resource \= rag.RagResource(  
       rag\_corpus=rag\_corpus.name,  
       \# Optional: Filter retrieval to specific files within the corpus if needed  
       \# rag\_file\_ids=\["rag-file-id-1", "rag-file-id-2"\]  
   )

   46  
7. **Integrate with Gemini:** Create the RAG retrieval tool and initialize the Gemini model with this tool.  
   Python  
   \# Create the RAG retrieval tool  
   rag\_retrieval\_tool \= Tool.from\_retrieval(  
       retrieval=rag.Retrieval(  
           source=rag.VertexRagStore(  
               rag\_resources=\[rag\_resource\], \# Use the resource defined above  
               rag\_retrieval\_config=rag\_retrieval\_config, \# Use the config defined above  
           ),  
           disable\_attribution=False \# Keep attribution (citations) enabled  
       )  
   )

   \# TODO: Choose appropriate Gemini model (e.g., gemini-2.0-flash-001, gemini-2.5-flash)  
   MODEL\_NAME \= "gemini-2.0-flash-001"

   \# Initialize the generative model with the RAG tool  
   rag\_model \= GenerativeModel(  
       model\_name=MODEL\_NAME,  
       tools=\[rag\_retrieval\_tool\]  
   )

   46  
8. **Generate Grounded Response:** Send a clinical query to the model. The RAG tool will be invoked automatically.  
   Python  
   \# TODO: Replace with an actual clinical query relevant to the ingested data  
   clinical\_query \= "What are the standard treatment protocols for moderate depression according to recent guidelines?"

   response \= rag\_model.generate\_content(clinical\_query)

   print("Generated Response:")  
   print(response.text)

   \# Inspect grounding metadata if needed (structure may vary slightly by model/API version)  
   \# print("\\nGrounding Metadata:")  
   \# print(response.candidates.grounding\_metadata)

   46

This step-by-step guide provides a functional template. HopeAI will need to adapt model names, resource names, data paths, chunking parameters, and retrieval configurations based on their specific environment and iterative testing results. The tight integration between the RAG Engine (configured as a Tool) and the GenerativeModel API simplifies the generation of grounded responses significantly, abstracting the underlying retrieval and context injection steps from the developer.46

### **C. Grounding Responses for Clinical Accuracy and Safety**

Grounding is the core principle behind RAG, ensuring that the LLM's responses are tethered to specific, verifiable information from the designated knowledge base.7 This mechanism is fundamental for building trust and ensuring safety in a clinical assistant application, as it directly combats the tendency of LLMs to hallucinate or generate factually incorrect statements.14

When using the RAG Engine integrated as a tool with the Gemini API (as shown in the SDK guide above), the grounding process is largely automated.46 The GenerativeModel automatically invokes the RAG tool to retrieve relevant context based on the user's query, and then uses this retrieved context to formulate its final response.

A key aspect of grounding, especially important for clinical applications, is **auditability**. The responses generated through the RAG tool often include grounding metadata, typically containing citations that link specific parts of the generated answer back to the source chunks retrieved from the knowledge base.7 This allows clinicians or auditors to verify the information's origin and assess the response's faithfulness to the source material. The exact structure of this metadata might vary, but it usually includes snippets of the source text and identifiers for the source document.63

While grounding on the curated clinical knowledge base should be the primary approach for HopeAI, Vertex AI also supports grounding with Google Search.7 This could be a fallback or supplementary option if a query requires broader, real-time world knowledge beyond the scope of the internal database, but its use should be carefully considered and potentially flagged to the user due to the less controlled nature of web sources compared to a curated clinical dataset.

## **V. Developing Autonomous AI Agents with Vertex AI Agent Builder**

Beyond simple question-answering, Vertex AI provides a powerful suite of tools under the umbrella of **Vertex AI Agent Builder** for creating more sophisticated, autonomous AI agents capable of reasoning, using tools, and interacting within complex workflows.2 These capabilities are particularly relevant for HopeAI in building assistants that can perform multi-step tasks, interact with other systems (like scheduling or EMRs), or maintain context over longer conversations. Google's significant investment in this area is evident through the recent introduction of several key components in early 2025 5, signaling a strategic move towards enabling more complex, collaborative, and enterprise-integrated AI systems.

### **A. Overview of Agent Development Kit (ADK), Agent Engine, Agent Garden (April 2025 Features)**

* **Agent Development Kit (ADK):** Introduced in Preview in April 2025 5, ADK is an open-source Python framework designed to simplify the construction of agents and multi-agent systems.13 It aims to make agent development feel more like traditional software development.69 Key features include:  
  * **Concise Code:** Ability to build a basic agent in under 100 lines of Python code.68  
  * **Control:** Provides deterministic guardrails and orchestration controls for precise management of agent behavior, reasoning, and collaboration.67  
  * **Rich Interaction:** Supports unique bidirectional audio and video streaming for more natural, human-like agent conversations.68  
  * **Flexibility:** Works with various models (Gemini optimized, but supports any model in Model Garden) and deployment targets (local, Cloud Run, Kubernetes, Vertex AI Agent Engine).68  
  * **Connectivity:** Supports the Model Context Protocol (MCP) for secure data connections and integrates with numerous tools and APIs.68  
  * **Framework:** Built on the same foundation as Google Agentspace and Customer Engagement Suite agents.68  
* **Agent Engine:** Generally available since March 2025 5, Agent Engine is a fully managed runtime environment within Vertex AI specifically designed for deploying, managing, and scaling AI agents built with ADK or other popular frameworks like LangChain, LangGraph, LlamaIndex, or even custom ones.68 It abstracts away significant infrastructure and operational complexities 35, allowing teams to focus on agent logic and quality. Key features include:  
  * **Managed Runtime:** Handles deployment, scaling, security (including VPC-SC support 71), monitoring (Cloud Trace/OpenTelemetry integration 71), and reliability.68  
  * **Framework Agnostic:** Supports deploying agents built with various Python frameworks.68  
  * **Memory:** Provides built-in support for short-term and long-term memory, enabling agents to maintain context across conversational sessions.68  
  * **Evaluation Integration:** Connects with the Vertex AI Gen AI Evaluation Service and Example Store for continuous quality measurement and improvement.68  
  * **Future Enhancements:** Planned capabilities include agent code execution ("computer-use capabilities") and a dedicated simulation environment for testing.68  
* **Agent Garden:** A repository of ready-to-use agent samples, tools, and pre-built patterns accessible within ADK.5 It serves as a valuable resource to accelerate development and learn best practices by example.  
* **Agent2Agent (A2A) Protocol:** Announced at Google Cloud Next 2025 (April), A2A is a new, open protocol designed to enable agents built on different frameworks or by different vendors to communicate, negotiate capabilities, and collaborate securely.12 This aims to break down silos and facilitate the creation of complex, multi-agent ecosystems where specialized agents can work together.67

The introduction of these integrated components (ADK for building, Agent Engine for deploying, Agent Garden for examples, A2A for collaboration) signifies Google's commitment to providing a comprehensive platform for enterprise agent development.

### **B. Step-by-Step Guide: Creating a Basic Agent with ADK (Python SDK)**

This guide follows the ADK quickstart 20 for setting up a simple agent locally.

1. **Prerequisites:** Ensure Python 3.10+ is installed. Set up the Google Cloud project and enable the Vertex AI API (as in Section II.A). Authenticate using ADC (gcloud auth application-default login).20 Create and activate a Python virtual environment.  
   Bash  
   python \-m venv.venv  
   source.venv/bin/activate \# macOS/Linux  
   \#.venv\\Scripts\\activate.bat \# Windows CMD  
   \#.venv\\Scripts\\Activate.ps1 \# Windows PowerShell

2. **Install ADK:**  
   Bash  
   pip install google-adk

   20  
3. **Project Structure:** Create a directory for your agent and the necessary files.  
   Bash  
   mkdir hopeai\_clinical\_agent  
   touch hopeai\_clinical\_agent/\_\_init\_\_.py hopeai\_clinical\_agent/agent.py hopeai\_clinical\_agent/.env

   20  
4. **Configure Environment (.env):** Set the necessary environment variables for Vertex AI access.  
   Fragmento de código  
   \# hopeai\_clinical\_agent/.env  
   GOOGLE\_CLOUD\_PROJECT="your-hopeai-project-id"  
   GOOGLE\_CLOUD\_LOCATION="us-central1" \# Or your chosen region  
   GOOGLE\_GENAI\_USE\_VERTEXAI="True"

   20  
5. **Define Agent Logic (agent.py):** Create a simple agent that can use a tool (initially, perhaps just a placeholder or a simple function).  
   Python  
   \# hopeai\_clinical\_agent/agent.py  
   import os  
   from adk import Agent, Tool, run\_local  
   from adk.config import init\_gcp  
   from adk.llm.vertexai import Gemini

   \# Initialize GCP settings from.env file  
   init\_gcp()

   \# Define a simple tool (replace with RAG tool later)  
   def get\_current\_time(query: str) \-\> str:  
       """Gets the current time."""  
       import datetime  
       return f"The current time is {datetime.datetime.now().isoformat()}"

   time\_tool \= Tool(  
       name="get\_current\_time",  
       description="Use this tool to get the current time.",  
       fn=get\_current\_time,  
   )

   \# Define the agent  
   clinical\_agent \= Agent(  
       name="HopeAI Clinical Assistant (Alpha)",  
       description="An assistant to help with clinical information retrieval.",  
       instructions=,  
       llm=Gemini(model="gemini-2.0-flash-001"), \# Or another suitable model  
       tools=\[time\_tool\], \# Add more tools later, like the RAG tool  
   )

   \# Main entry point for local execution if needed  
   if \_\_name\_\_ \== "\_\_main\_\_":  
       run\_local(clinical\_agent)

   *(Adapted from ADK concepts 68 and quickstart structure 20)*  
6. **Run Locally:** Launch the ADK developer UI or CLI from the directory *containing* hopeai\_clinical\_agent.  
   * *Web UI:*  
     Bash  
     adk web  
     Then open the provided URL (e.g., http://localhost:8000) in a browser and select hopeai\_clinical\_agent.  
   * *Command Line:*  
     Bash  
     adk run hopeai\_clinical\_agent

Interact with the agent by typing prompts (e.g., "What time is it?"). 20

### **C. Integrating Tools: Connecting the RAG System to an Agent**

Agents derive much of their power from their ability to use "tools"—functions that allow them to interact with external APIs, databases, or other systems.41 To make the clinical assistant truly useful, the RAG system built in Section IV needs to be integrated as a tool.

This involves:

1. **Defining the RAG Tool Function:** Create a Python function within agent.py (or a separate module) that encapsulates the logic for querying the RAG system. This function would likely:  
   * Accept the user's query as input.  
   * Instantiate the GenerativeModel with the pre-configured RAG retrieval tool (as developed in Section IV.B, Step 7).  
   * Call rag\_model.generate\_content() with the user's query.  
   * Return the grounded text response.  
2. **Creating an adk.Tool:** Wrap the RAG query function within an adk.Tool object, providing a clear name and description so the agent's LLM understands when and how to use it.  
   Python  
   \# Example within agent.py  
   \# (Assuming rag\_model is initialized appropriately, potentially in a helper function)  
   from adk import Tool  
   \#... other imports and initialization...

   def query\_clinical\_knowledge\_base(user\_query: str) \-\> str:  
       """  
       Queries the HopeAI clinical knowledge base to answer user questions  
       about clinical guidelines, patient information summaries (if applicable),  
       or medical research. Use this for specific clinical questions.  
       """  
       try:  
           \# Ensure rag\_model is initialized (consider lazy loading or global setup)  
           \# global rag\_model \# Or pass it in, or use a class structure  
           response \= rag\_model.generate\_content(user\_query) \# rag\_model has the RAG tool  
           return response.text  
       except Exception as e:  
           print(f"Error querying RAG system: {e}")  
           return "Sorry, I encountered an error trying to access the clinical knowledge base."

   rag\_query\_tool \= Tool(  
       name="query\_clinical\_knowledge\_base",  
       description="Queries the internal HopeAI clinical knowledge base for specific medical or psychological information.",  
       fn=query\_clinical\_knowledge\_base,  
   )

   \# Update the agent definition to include the new tool  
   clinical\_agent \= Agent(  
       \#... other parameters...  
       tools=\[time\_tool, rag\_query\_tool\], \# Add the RAG tool  
   )

3. **Agent Invocation:** When the user asks a clinical question, the agent's underlying LLM (e.g., Gemini) should recognize, based on the tool description and the query, that the query\_clinical\_knowledge\_base tool is appropriate. The ADK framework handles the function calling process, executing the tool function and feeding the result back to the LLM to formulate the final answer.

ADK and Agent Engine support connecting to a wide range of tools beyond custom functions, including databases (via MCP Toolbox 70), Google Maps 68, Google Search 68, other agent frameworks, and standard APIs.68

### **D. Managing Agent Memory and State**

For an effective clinical assistant, especially one involved in multi-turn interactions or personalization, maintaining context (memory) is crucial.13 A stateless agent would require the user to repeat information constantly.

Vertex AI Agent Engine explicitly supports both **short-term memory** (for maintaining context within a single conversation session) and **long-term memory** (for recalling past interactions or user preferences across sessions).68 This built-in capability simplifies development compared to manually implementing complex memory management systems.35 While the specific mechanisms for configuring and utilizing this memory within ADK and Agent Engine are not fully detailed in the provided snippets, the platform's explicit support for it is a significant advantage. Developers should consult the latest ADK and Agent Engine documentation for implementation details.

### **E. Deploying and Managing Agents via Agent Engine**

Once the agent is developed and tested locally using ADK, the next step is deployment to a scalable, managed environment using Agent Engine.68

* **Deployment Process:** While specific CLI/SDK commands are not detailed in the snippets, the process generally involves packaging the ADK agent application and deploying it to the Agent Engine runtime.71 The agent-starter-pack GitHub repository is recommended for a streamlined IDE-based development and deployment workflow, providing templates and simplifying operations.67 Agent Engine's framework-agnostic nature means agents built with LangChain, LlamaIndex, etc., can also be deployed, often using provided SDK templates or adapting a custom template.68  
* **Management:** Post-deployment, Agent Engine handles scaling, security (VPC-SC), and provides monitoring through Cloud Trace.71 The integration with evaluation tools allows for ongoing quality assessment and refinement based on usage.68

The abstraction provided by Agent Engine significantly lowers the barrier to deploying production-ready agents. By handling infrastructure, scaling, and core operational concerns, it allows the HopeAI team to concentrate on refining the agent's clinical capabilities and ensuring its safety and effectiveness.35 The built-in integration of evaluation tools further emphasizes the importance of continuous monitoring and improvement, a critical practice for AI systems in sensitive domains like healthcare.

## **VI. Orchestration, Evaluation, and Iteration (MLOps)**

Developing and deploying advanced LLM solutions like RAG systems and autonomous agents is not a one-off task but an iterative process requiring robust MLOps practices. Vertex AI provides tools for orchestrating workflows, managing experiments, evaluating performance, and monitoring deployed models.

### **A. Orchestrating Workflows with Vertex AI Pipelines**

Vertex AI Pipelines offers a serverless way to orchestrate ML workflows, allowing HopeAI to automate and manage the sequence of steps involved in training, evaluation, and deployment.19 Built upon the Kubeflow Pipelines SDK, it enables the definition of workflows as Python code.23

* **Building Pipelines:** Pipelines are defined as Python functions annotated with @kfp.dsl.pipeline. Within the function, individual steps are represented as components. These can be custom components (packaged as container images or Python functions) or pre-built Google Cloud Pipeline Components that simplify interaction with Vertex AI services like AutoML, data validation, or model deployment.23 Dependencies between components define the workflow graph.23  
* **Compilation and Execution:** The Python pipeline definition is compiled into a YAML file using kfp.compiler.Compiler. This compiled pipeline can then be submitted for execution on Vertex AI Pipelines via the SDK or gcloud CLI.23  
* **Tracking:** Pipeline runs, parameters, and artifacts can be automatically tracked using Vertex AI Experiments and Vertex ML Metadata, providing lineage and facilitating reproducibility.73  
* **Use Cases for HopeAI:** While specific LLM/RAG/Agent pipeline examples are limited in the source material 130, pipelines can automate critical processes for HopeAI, such as:  
  * Scheduled re-training or fine-tuning of models (e.g., MedLM) as new clinical data becomes available.  
  * Automated updates to the RAG knowledge base (ingestion, chunking, indexing).  
  * Regular evaluation runs for RAG systems or agents against benchmark datasets.  
  * CI/CD workflows for deploying new agent versions after successful evaluation.

### **B. Alpha Phase Experimentation**

The Alpha phase is critical for iterating on designs and validating performance. Vertex AI provides tools specifically for managing and comparing experiments.

* Tracking Configurations with Vertex AI Experiments:  
  Vertex AI Experiments serves as a central hub for tracking and analyzing different development iterations.74 For HopeAI, this means logging:  
  * **Experiment Runs:** Each attempt with a specific configuration (e.g., a particular prompt version, a set of RAG parameters, a different agent instruction set).  
  * **Parameters:** Logging the specific inputs for each run, such as the exact prompt text, chunk size used, top\_k retrieval value, model temperature, or agent instructions.74  
  * **Metrics:** Recording the performance outcomes for each run, such as RAG evaluation scores (faithfulness, relevance), user feedback ratings, or task completion rates.74  
  * **Artifacts:** Storing outputs like generated responses or evaluation reports.74 The Vertex AI SDK allows for programmatic logging of these parameters and metrics within development scripts or evaluation pipelines.74 The Console provides a visual interface for comparing runs side-by-side, analyzing parameter-metric correlations, and identifying the best-performing configurations.74 Structuring experiments logically (e.g., rag\_chunk\_size\_tuning, prompt\_ab\_test\_symptom\_query) is key for organized analysis.74  
* A/B Testing Prompts: Tools & Techniques:  
  Optimizing prompts is crucial for eliciting desired behavior from LLMs, especially for nuanced clinical interactions.40 Vertex AI offers several ways to compare prompt performance:  
  * **Generative AI Studio:** Useful for initial, rapid, qualitative comparison. Developers can manually input the same query using different prompt variations (up to 3 side-by-side 5) and visually inspect the outputs.25 While not a formal A/B test, it facilitates quick iteration during design.  
  * **Vertex AI Evaluation Service (Pairwise):** This is a more formal approach. By setting up a pairwise evaluation, HopeAI can directly compare the outputs generated by two different prompt versions (treating each prompt variation as a different "model" setup in the evaluation task) for the same set of input queries.73 The service calculates win rates (candidate\_model\_win\_rate) and can use a judge model (like Gemini) to provide explanations for why one response was preferred over the other based on defined criteria (e.g., clarity, clinical relevance).73 This requires a well-defined evaluation dataset.77  
  * **LLM Comparator:** This open-source tool, which integrates with the Vertex AI Evaluation Service, facilitates human-in-the-loop evaluation.73 It presents outputs from two prompt versions side-by-side, allowing clinical experts to provide ratings and rationale.73 Its "Rationale Summary" feature offers insights into *why* one prompt might be performing better, aiding explainability.73 This is invaluable for capturing subtle qualitative differences critical in clinical contexts.  
  * **Vertex AI Prompt Optimizer (Preview):** While not strictly A/B testing, this tool can automatically optimize prompt instructions and few-shot examples based on a small labeled dataset.75 It could be used to refine a winning prompt identified through A/B testing or to adapt a prompt for a different model.  
  * **Third-Party Tools:** Platforms like Langfuse integrate with Vertex AI and offer dedicated features for prompt version management, A/B testing execution, and results analysis, potentially providing a more streamlined workflow for this specific task.78

### **C. Evaluating RAG Systems for Clinical Effectiveness**

Evaluating a RAG system requires assessing both the retrieval quality and the generation quality, using metrics specifically designed for this paradigm.80 For HopeAI's clinical assistant, evaluation must focus on metrics relevant to healthcare accuracy and safety.10

* **Key Metrics for Clinical RAG:** Based on research and platform capabilities, critical metrics include:  
  * **Faithfulness / Groundedness:** Ensuring the generated answer strictly adheres to the information within the retrieved clinical documents, avoiding hallucination.10 Measured via groundedness in Vertex AI Eval 81 or Faithfulness in Ragas.83  
  * **Context Relevance / Precision:** Assessing whether the documents retrieved from the knowledge base are actually relevant to the user's clinical query.10 Measured via ContextPrecision in Ragas 83; Vertex AI Eval assesses indirectly via answer relevance.81  
  * **Answer Relevance:** Determining if the final generated answer directly addresses the user's question.10 Measured via question\_answering\_relevance in Vertex AI Eval.81  
  * **Completeness:** Evaluating if the answer provides all clinically necessary information pertinent to the query.10 May require custom metrics or expert human judgment; question\_answering\_helpfulness or fulfillment in Vertex AI Eval might partially capture this.81  
  * **Refusal Accuracy:** Assessing the system's ability to correctly decline to answer questions that are out-of-scope, inappropriate, or unsafe in a clinical context.82 Requires specific test cases and likely custom evaluation logic or judge prompts.  
  * **Clinical Harm Potential / Safety:** Identifying responses that could potentially lead to negative clinical outcomes due to inaccuracy or misleading information.10 This requires careful evaluation by clinical experts.  
* **Tools for Measurement:**  
  * **Vertex AI Evaluation Service:** Provides a framework for running evaluations using both computation-based and model-based metrics (pointwise or pairwise).73 Judge models (like Gemini) can assess qualitative aspects based on prompts defining clinical criteria.86 Custom metrics can be defined via the SDK.86 Notebooks demonstrate evaluating RAG use cases.81  
  * **Ragas Library:** An open-source option specifically designed for RAG evaluation, offering metrics like Faithfulness and Context Precision.83 It integrates with Vertex AI models, and example notebooks are available.83  
  * **Human Evaluation:** Indispensable for clinical validation, especially for assessing potential harm, nuance, and overall helpfulness.10 Tools like LLM Comparator can structure this process.73

The complexity of evaluating RAG systems, particularly in a high-stakes domain like healthcare, necessitates a multi-faceted approach. HopeAI should establish a rigorous evaluation framework early in the Alpha phase, combining automated metrics for efficiency (using Vertex AI Evaluation Service and potentially Ragas) with structured human review by clinical psychologists and other relevant experts to ensure safety and clinical validity.

**Table 2: RAG Evaluation Metrics for Clinical Context**

| Metric Name | Description | How to Measure (Vertex AI Tool/Metric, Ragas Metric, Human Eval) | Key Considerations for Clinical Use | Relevant Sources |
| :---- | :---- | :---- | :---- | :---- |
| Faithfulness / Groundedness | Does the answer accurately reflect information ONLY from the retrieved clinical context? Avoids hallucination. | Vertex AI Eval (groundedness, custom judge prompt); Ragas (Faithfulness); Human Eval | Critical for preventing misinformation; check against specific retrieved chunks. | 10 |
| Context Relevance/Precision | Is the retrieved clinical context pertinent to the user's query? | Ragas (ContextPrecision); Human Eval; Vertex AI Eval (indirectly via answer relevance/quality) | Ensures the LLM receives appropriate information; poor retrieval leads to poor generation. | 10 |
| Answer Relevance | Does the final generated answer directly address the user's clinical question? | Vertex AI Eval (question\_answering\_relevance, custom judge prompt); Human Eval | Ensures the assistant stays on topic and provides useful information. | 10 |
| Completeness | Does the answer provide all clinically necessary/relevant aspects related to the query? | Human Eval (Expert Review); Vertex AI Eval (question\_answering\_helpfulness, fulfillment, custom judge prompt \- potentially) | Crucial for clinical decision support; avoid omitting critical details. | 10 |
| Refusal Accuracy | Does the system correctly refuse to answer out-of-scope, unsafe, or inappropriate questions? | Human Eval (using specific test cases); Vertex AI Eval (custom metric/judge prompt for specific refusal scenarios) | Prevents providing harmful advice or operating outside defined clinical boundaries. | 82 |
| Clinical Harm Potential | Could the response lead to negative health outcomes if followed? | Human Eval (Clinical Expert Review) | Paramount safety concern; requires domain expertise to assess potential risks. | 10 |

### **D. Monitoring LLM Usage and Performance**

Continuous monitoring after deployment is essential for maintaining performance, managing costs, and detecting issues.

* **Vertex AI Model Observability Dashboard:** This prebuilt dashboard in Cloud Monitoring provides insights into the usage (QPS), latency (first token), throughput (tokens), and error rates for fully-managed models (MaaS) like Gemini and partner models accessed via API.89 However, it may not cover metrics for self-hosted models or potentially specific metrics related to RAG Engine or Agent Engine usage.89  
* **Cloud Monitoring Metrics:** Provides more granular metrics on Vertex AI API usage, including request counts, error rates by API method, and overall latency.90 Specific metrics for token consumption might be less direct and may need to be inferred from prediction counts or performance metrics, or tracked using other methods.91 Elastic Observability offers an integration that explicitly tracks token usage.91  
* **Token Counting Mechanisms:**  
  * **API/SDK:** Use the countTokens method (e.g., model.count\_tokens() in Python SDK) to get an estimate of the token count and billable characters for a *prompt* before sending it.93 This is crucial for managing context window limits and estimating costs.  
  * **Response Metadata:** After calling generate\_content, access the usage\_metadata attribute in the response object to get the actual token counts for the prompt (prompt\_token\_count), the generated response (candidates\_token\_count), and the total (total\_token\_count).96 This provides accurate post-hoc usage data.  
* **Third-Party Tools:** Consider tools like Langfuse 99 or Weave 18 which offer integrations with Vertex AI and provide more detailed LLM observability, including potentially easier tracking of token usage and costs across requests.

Effective MLOps for HopeAI involves integrating these orchestration, evaluation, and monitoring tools into a continuous cycle. Pipelines automate routine tasks, Experiments track iterative improvements, Evaluation services (combined with human expertise) validate performance against clinical standards, and Monitoring provides visibility into production behavior and resource consumption.

## **VII. Responsible AI for HopeAI's Clinical Assistant**

Developing AI for clinical-psychological applications carries significant ethical responsibilities. HopeAI must prioritize safety, fairness, privacy, and transparency throughout the development and deployment lifecycle. Vertex AI provides tools and frameworks aligned with Google's AI Principles to support responsible AI development, but ultimate accountability rests with the application developer.

### **A. Applying Google's AI Principles in a Healthcare Context**

Google's updated AI Principles (February 2025\) emphasize bold innovation balanced with responsible development and collaboration.100 A core tenet is ensuring that the potential benefits substantially outweigh foreseeable risks.100 In healthcare, this translates to a cautious yet progressive approach.11 Over-reliance on AI without human oversight is risky, yet excessive human intervention can negate efficiency gains.11 HopeAI needs to establish clear guidelines for AI use, define technology roadmaps aligned with clinical priorities, foster AI literacy among staff, and implement robust frameworks for safety, trust, and fairness.11

### **B. Ensuring Data Privacy and Security (HIPAA Compliance on Vertex AI)**

Handling Protected Health Information (PHI) requires strict adherence to regulations like the Health Insurance Portability and Accountability Act (HIPAA).

* **Vertex AI and BAA:** Vertex AI Platform is listed as a HIPAA-covered service under Google Cloud's Business Associate Agreement (BAA).15 HopeAI **must** execute a BAA with Google Cloud to use Vertex AI with PHI.15  
* **Data Handling Commitments:** Google commits that customer data (including prompts and fine-tuning datasets) used within Vertex AI Generative AI services is not used to train Google's foundation models and is not exposed to other customers.102 Interactions with models like Gemini remain within the customer's organization.102  
* **Best Practices for PHI on Vertex AI:**  
  * Use only BAA-covered services when processing PHI.15  
  * Implement the principle of least privilege using IAM roles.15  
  * Utilize **Sensitive Data Protection** service to scan datasets for PHI before using them for RAG ingestion or fine-tuning, allowing for de-identification or masking.103  
  * Ensure data encryption at rest (default on Google Cloud) and consider additional encryption needs.15  
  * Configure and regularly review audit logs for access and usage monitoring.15  
  * Use regional resource locations where possible if required for data residency, noting potential limitations of some services.15  
  * Consider organizational units (OUs) and strict sharing policies if using Google Workspace data sources.101

Adherence to these practices is crucial for maintaining HIPAA compliance when building the clinical assistant.

### **C. Configuring and Utilizing Vertex AI Safety Filters & Guardrails**

Vertex AI incorporates multi-layered safety mechanisms to mitigate the generation of harmful or inappropriate content.14

* **Non-Configurable Filters:** Automatically block severe harms like CSAM and attempt to filter PII.104 This provides a baseline protection layer.  
* **Configurable Content Filters:** Assess content against four main categories: Harassment, Hate Speech, Sexually Explicit, and Dangerous Content.104  
  * **Clinical Relevance:** The "Dangerous Content" filter is particularly important for HopeAI, as it aims to block content promoting harmful activities, which in a clinical context could include unsafe medical advice.104 Other filters help maintain professional and unbiased interactions.  
  * **Thresholds:** Developers can set blocking thresholds (BLOCK\_LOW/MEDIUM/HIGH\_AND\_ABOVE, OFF, BLOCK\_NONE \- restricted) based on the model's assessment of probability and/or severity of harm for each category.104 Configuration is possible via the SDK or the Console's Safety Settings dialog.104  
  * **Recommendation:** For clinical applications, starting with stricter thresholds (e.g., BLOCK\_MEDIUM\_AND\_ABOVE or BLOCK\_LOW\_AND\_ABOVE for Dangerous Content) is advisable during the Alpha phase, followed by careful testing and iteration to find the right balance between safety and utility.104  
* **MedLM Safety:** Specific safety filter thresholds (block most, block some, block few) are available in Vertex AI Studio when using MedLM models.105  
* **Limitations:** Safety filters are not infallible and may block benign content or miss harmful content.14 They act as barriers, not as methods to steer model behavior fundamentally.104

### **D. Bias Detection and Mitigation Considerations**

LLMs can inherit and perpetuate societal biases present in their vast training data, posing a significant risk in healthcare where biased outputs could lead to disparities in care.14

* **Detection:** Vertex AI relies on evaluation against fairness benchmarks (like BBQ, Winogender mentioned for Gemma 106) and potentially custom metrics designed to probe for specific biases (e.g., demographic parity 107). Google performs internal red-teaming and evaluations.100 However, dedicated tools within Vertex AI specifically for *detecting* bias in LLMs seem less mature than those for traditional ML models.108 HopeAI will need to proactively design evaluation datasets and metrics relevant to clinical-psychological biases (e.g., related to demographics, conditions, socioeconomic status) and potentially use the Gen AI Evaluation Service with custom judge prompts to assess fairness.  
* **Mitigation:** Strategies include:  
  * Careful curation and pre-processing of fine-tuning datasets to remove or balance biased content.106  
  * Thoughtful prompt engineering and system instructions to guide the model towards neutral and equitable responses.100  
  * Ongoing monitoring of model outputs in production for biased patterns.  
  * Incorporating diverse perspectives during development and testing.

### **E. Explainability for Clinical Trust**

Understanding *why* an AI assistant provides a particular piece of information is crucial for building clinician trust and ensuring safe use.73

* **Vertex Explainable AI:** While powerful for traditional ML (offering feature attributions and example-based explanations 109), its direct applicability to explaining the internal reasoning of large generative models like Gemini or MedLM appears limited based on current documentation.110  
* **RAG Citations:** The grounding mechanism inherent in RAG provides a practical form of explainability. By citing the specific source documents or chunks from the knowledge base used to generate an answer, the system allows users to trace the information back to its origin.7 This is likely the most valuable explainability feature for HopeAI's RAG system.  
* **LLM Comparator Rationale:** During pairwise evaluation, the "Rationale Summary" feature can offer insights into why a judge model preferred one response, providing a form of comparative explanation.73

### **F. Establishing Human Oversight Workflows**

Given the critical nature of healthcare, relying solely on automated systems is insufficient. Human oversight is essential.11

* **Need for Oversight:** Clinicians or designated reviewers should be involved in validating AI outputs, especially during the Alpha phase and for high-risk interactions.  
* **Integration Points:** Potential workflows include:  
  * Review queues for AI-generated summaries or responses before they are finalized or presented.  
  * Auditing logs of agent actions or decisions.  
  * Clear escalation paths for when the AI encounters uncertainty, detects potential safety issues via filters, or provides low-confidence responses.  
* **Vertex AI Support:** The platform does not appear to offer a specific, built-in feature for human-in-the-loop review of general LLM outputs in production.113 While Agent Engine includes evaluation integration 68, real-time review workflows would likely need to be custom-built at the application layer by HopeAI. This might involve integrating Vertex AI outputs with task management systems, custom clinician dashboards, or using Vertex AI Pipelines to route specific outputs for human review based on predefined rules or confidence scores.

Responsible AI development for HopeAI is a continuous process involving technical configurations (HIPAA compliance, safety filters), rigorous evaluation (bias, accuracy, safety), and crucially, the implementation of human-centered processes for oversight and validation. It operates on a shared responsibility model: Google provides the secure platform and tools, while HopeAI must configure them appropriately, manage data responsibly, conduct domain-specific evaluations, and build necessary application-level safeguards.

**Table 3: Responsible AI Tools & Features in Vertex AI for Healthcare**

| Feature/Tool | Description & Applicability to Clinical Use Cases | Relevant Vertex AI Components/APIs | Key Considerations/Limitations | Relevant Sources |
| :---- | :---- | :---- | :---- | :---- |
| **HIPAA Compliance** | Vertex AI is a BAA-covered service. Essential for processing PHI. | Google Cloud BAA; Vertex AI Platform | HopeAI must sign BAA with Google Cloud. Use only covered services. | 15 |
| **Data Privacy Controls** | Google commitments on data usage; Sensitive Data Protection service for scanning/masking PHI before use. | Vertex AI Service Terms; Sensitive Data Protection API | Customer responsibility for data handling within their project; SDP requires proactive implementation. | 15 |
| **Safety Filters** | Configurable filters (Harassment, Hate Speech, Sexually Explicit, Dangerous Content) & non-configurable (CSAM, PII). | Vertex AI Gemini API (safety\_settings); Vertex AI Studio UI; MedLM-specific settings | Filters aren't foolproof; require tuning & testing. "Dangerous Content" filter critical for clinical safety. | 14 |
| **Bias Evaluation** | Assessment via fairness benchmarks & custom metrics during evaluation. Google performs internal checks. | Vertex AI Evaluation Service (custom metrics, judge models); Standard Benchmarks (e.g., BBQ) | Dedicated LLM bias detection tools in Vertex AI less explicit; requires custom datasets/metrics for clinical bias. | 14 |
| **Explainability** | Primarily through RAG citations linking answers to knowledge base sources. LLM Comparator provides comparative rationale. | RAG Engine/API response metadata; LLM Comparator (Rationale Summary) | Vertex Explainable AI less applicable to generative LLMs. Focus on traceability via RAG. | 7 |
| **Human Oversight** | Necessary for validation & safety in clinical settings. Requires application-level implementation. | Custom application workflows; potentially Vertex AI Pipelines for routing tasks. | No dedicated built-in Vertex AI feature for general LLM output review workflows found in snippets. Requires custom build. | 11 |

## **VIII. Managing Costs for Sustainable Development**

Deploying advanced LLM solutions involves ongoing costs. Understanding Vertex AI's pricing structure and implementing cost management strategies is essential for the sustainability of the HopeAI project.

### **A. Understanding Vertex AI Generative AI Pricing (Tokens, Characters, Nodes)**

Vertex AI employs several pricing models for its generative AI capabilities, and costs can accumulate across different services used in a RAG or agent workflow 44:

* **Model Interaction Costs:**  
  * **Per Token:** Many newer models (Gemini 2.5 family, Llama 4 MaaS, some partner models) are priced based on the number of input and output tokens, often measured per 1,000 or 1 million tokens.39 Pricing might be tiered based on context window size (e.g., Gemini 2.5 Pro) or modality (e.g., Gemini 2.5 Flash differentiating text/image/video vs. audio input).44  
  * **Per Character:** Some models (older Gemini versions, Codey) are priced per 1,000 input and output characters.44 Google estimates roughly 4 characters per token for comparison.44  
  * **Per Modality Unit:** For multimodal inputs/outputs, costs can be per image (Imagen generation/editing, Gemini input), per second of video (Veo generation, Gemini input), or per second of audio (Gemini input, Chirp output).44  
* **Infrastructure and Service Costs:**  
  * **Prediction Endpoints:** Deploying models often involves node-hour charges for the virtual machines hosting the model.116 Costs vary based on machine type and number of nodes.  
  * **Fine-Tuning:** Charged per node-hour based on the compute resources used during the tuning process.5  
  * **Vertex AI Pipelines:** Incurs a small fee per pipeline run, plus costs for the underlying compute resources used by pipeline components.117  
  * **RAG Engine / Search / Vector Search:** Costs are associated with data indexing/storage and query execution. RAG Engine costs depend on the chosen backend (e.g., Vertex AI Search query costs, Vector Search node/storage costs).52  
  * **Agent Engine:** Billing commenced in March 2025 5, likely based on compute resources consumed by the managed runtime.  
* **Other Features:**  
  * **Grounding:** Grounding with Google Search may have a free tier followed by per-request charges. Grounding with own data (via RAG Engine/Search) incurs costs associated with the retrieval mechanism.44  
  * **Context Caching:** Incurs standard input token cost upon cache creation, reduced cost for cache hits, and storage costs based on cache size and duration.44

It is crucial to consult the official **Vertex AI Pricing page** ([cloud.google.com/vertex-ai/generative-ai/pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing?authuser=1)) for the most current and detailed information, including specific rates for different models, regions, and features.39 Online calculators might exist but may not reflect the latest pricing or all components.118

### **B. Monitoring Costs with Cloud Billing Reports and Tools**

Google Cloud provides tools to track and analyze spending:

* **Cloud Billing Reports:** Accessible via the Google Cloud Console, these reports allow filtering and grouping to understand cost drivers. To analyze Vertex AI costs specifically:  
  * Filter by **Service** \= "Vertex AI".122  
  * **Group by SKU** to see the most granular breakdown, often separating costs by specific model usage (e.g., "Gemini 2.0 Flash Input Characters"), feature (e.g., "Vertex AI Pipelines Run Execution"), or resource type (e.g., "Vertex AI Prediction node hour").123  
  * Analyze trends over time using the **Time range** selector.123  
  * Export data to **CSV** for offline analysis.123  
* **Firebase Console (Usage and Billing):** If using the Vertex AI in Firebase SDKs for mobile/web integration, this dashboard shows associated costs.90

Regularly reviewing these reports, particularly grouped by SKU, is essential for understanding where Vertex AI costs are originating within the HopeAI project.

### **C. Setting Up Budget Alerts for Vertex AI Services**

To prevent unexpected cost overruns, configure Cloud Billing budget alerts:

* **Creation:** Navigate to "Budgets & alerts" in the Billing section of the Google Cloud Console.124  
* **Scope:** Define the budget scope to cover the entire HopeAI project or specifically filter for the "Vertex AI" service.124  
* **Amount:** Set a target budget amount (fixed or based on previous spend).124  
* **Thresholds:** Configure alert rules based on percentages of the budget (e.g., 50%, 90%, 100%) triggered by actual or forecasted spend.124  
* **Notifications:** Set up email notifications for billing administrators, project owners, or custom email addresses via Cloud Monitoring channels. Programmatic notifications via Pub/Sub can also be configured for automated responses.124

Remember that there's a delay (potentially days) between resource usage and billing reporting, so alerts might lag actual spending.125 Set budgets slightly below hard limits.

### **D. Cost Optimization Best Practices for LLM Workloads**

Several strategies can help manage Vertex AI costs for LLM applications:

* **Model Selection:** Use the smallest, fastest model that meets the performance requirements for a given task (e.g., Gemini 2.0 Flash-Lite vs. Gemini 2.5 Pro).37 Evaluate cost-performance trade-offs.  
* **Prompt Engineering:** Concise prompts reduce input token/character counts.76 Fine-tuning can sometimes allow for simpler prompts, reducing costs.41  
* **Token Counting:** Use the CountTokens API/SDK method and response usage\_metadata to monitor token usage per request and stay within context limits.93  
* **Caching:**  
  * **Vertex AI Context Caching:** For Gemini models, cache frequently used prompt prefixes to reduce input token costs on subsequent calls.5  
  * **Application-Level Caching:** Cache full responses to identical queries at the application layer to avoid redundant API calls.116  
* **Batching:** Utilize Vertex AI Batch Prediction for tasks that don't require real-time responses, as it can be more cost-effective than online prediction for large datasets.2 Batch prediction is supported for Gemini and Llama models.5  
* **Resource Optimization:**  
  * **Endpoints:** Right-size compute nodes for prediction endpoints. Use auto-scaling to adjust node counts based on traffic.116  
  * **Compute:** Consider using Spot VMs for training or batch prediction jobs if the workload can tolerate potential preemption, offering significant cost savings.55 Use reservations for predictable workloads needing guaranteed capacity.55  
* **RAG Optimization:** Efficient retrieval (good chunking, metadata filtering, ranking) minimizes the amount of context passed to the LLM, reducing token costs.49  
* **Monitoring:** Continuously monitor cost reports and performance metrics to identify high-cost operations or underutilized resources.116  
* **Discounts:** Explore Committed Use Discounts (CUDs) for long-term, stable workloads.116 For very high, predictable throughput, investigate Provisioned Throughput (GSUs).44

Managing Vertex AI costs requires a proactive and multi-faceted approach. HopeAI should integrate cost considerations into the design phase (model selection, RAG strategy), actively monitor usage using Cloud Billing and token counting tools, and apply relevant optimization techniques like caching, batching, and resource tuning.

## **IX. Conclusion and Recommendations for HopeAI**

Vertex AI offers a powerful and rapidly evolving platform for HopeAI to build its envisioned telehealth clinical assistant, leveraging state-of-the-art LLMs, RAG, and autonomous agent capabilities. As of April 2025, the platform provides a rich ecosystem of models, managed services like RAG Engine and Agent Engine, and robust MLOps tools for evaluation and orchestration. However, realizing this potential requires a strategic, iterative, and responsible approach.

### **A. Summary of Key Implementation Steps and Best Practices**

The journey involves several key stages:

1. **Foundation:** Setting up the Google Cloud project, enabling APIs, configuring authentication (ADC for local development), and understanding the roles of the Console/Studio versus the SDK.  
2. **Core Components:** Selecting appropriate foundation models (Gemini, MedLM, Llama 4\) from Model Garden and carefully building/managing the clinical knowledge base for RAG (ingestion, chunking, metadata, indexing via Vertex AI Search or Vector Search).  
3. **RAG Implementation:** Utilizing the Vertex AI RAG Engine (via SDK) integrated with Gemini to build a system that provides accurate, grounded responses based on the clinical knowledge base.  
4. **Agent Development:** Leveraging the new Agent Development Kit (ADK) to build the agent logic (including integrating the RAG system as a tool) and deploying it via the managed Agent Engine runtime.  
5. **Evaluation & Iteration:** Establishing a robust MLOps cycle using Vertex AI Pipelines for orchestration, Vertex AI Experiments for tracking configurations, and Vertex AI Evaluation Service (combined with Ragas and human review) for assessing performance against clinical metrics (faithfulness, relevance, safety). A/B testing prompts is crucial during the Alpha phase.  
6. **Responsible AI:** Adhering strictly to HIPAA compliance, configuring safety filters appropriately, actively monitoring for bias, ensuring traceability through RAG citations, and implementing necessary human oversight workflows.  
7. **Cost Management:** Understanding the pricing models, actively monitoring costs via Cloud Billing reports and token counting tools, and applying optimization best practices.

Key best practices emphasized throughout include adopting an **SDK-first approach** for building the core RAG and agent systems due to complexity and automation needs; embracing **iterative development** driven by **rigorous evaluation** using both automated metrics and expert human review; prioritizing **responsible AI principles** at every step; and implementing **proactive cost monitoring and optimization**.

### **B. Tailored Recommendations for the HopeAI Telehealth Project**

Based on the analysis of Vertex AI capabilities (as of April 2025\) and the specific needs of a clinical-psychological telehealth assistant:

1. **Model Strategy:**  
   * **Initial Focus:** Begin with **Gemini 2.0 Flash** or **Gemini 2.5 Flash (Preview)** for RAG due to their balance of capability, cost, and multimodal support.37  
   * **Clinical Specialization:** Evaluate **MedLM (Medium/Large)** specifically for core clinical QA and summarization tasks where its specialized tuning may offer advantages.40 Secure necessary access early.  
   * **Fine-Tuning:** Consider supervised fine-tuning (e.g., on Gemini 2.0 Flash 5) only if baseline models prove insufficient for specific clinical language nuances or tasks, ensuring strict adherence to data privacy (using de-identified data or Sensitive Data Protection 103).  
2. **RAG Implementation:**  
   * **Start with Managed Services:** Use **Vertex AI RAG Engine** with **Vertex AI Search** as the backend for the Alpha phase to accelerate development and leverage managed indexing and retrieval.7  
   * **Knowledge Base Focus:** Prioritize creating a high-quality, curated clinical knowledge base. Invest heavily in defining optimal **chunking strategies** and **metadata schemas** for clinical documents. Plan for iterative updates using Vertex AI Search APIs.52  
3. **Agent Strategy:**  
   * **Focused Agent:** Begin by building a single, focused agent using the **Agent Development Kit (ADK)** primarily responsible for handling clinical queries via the integrated RAG tool.20  
   * **Deployment:** Deploy this agent using **Agent Engine** for managed scaling and operations.68  
   * **Defer Complexity:** Postpone exploration of complex multi-agent systems using A2A until the core RAG-based assistant is validated and stable.68  
4. **Evaluation Framework:**  
   * **Hybrid Approach:** Implement a hybrid evaluation strategy from the outset. Use **Vertex AI Evaluation Service** with custom judge prompts and potentially **Ragas** for automated metrics like faithfulness and relevance.73  
   * **Expert Review:** Critically, incorporate structured **human review by clinical psychologists and relevant medical experts** to assess clinical accuracy, safety, nuance, potential harm, and refusal accuracy.10 Use **LLM Comparator** to facilitate side-by-side human comparisons.73  
   * **Tracking:** Use **Vertex AI Experiments** systematically to track all prompt A/B tests and RAG configuration trials.74  
5. **Responsible AI Implementation:**  
   * **Compliance:** Ensure the Google Cloud BAA is executed. Implement robust IAM controls and consider using Sensitive Data Protection for data scanning.15  
   * **Safety:** Configure Vertex AI safety filters, particularly for "Dangerous Content," starting with conservative settings (e.g., BLOCK\_MEDIUM\_AND\_ABOVE) and adjust based on rigorous testing.104  
   * **Bias:** Proactively design evaluation datasets to test for potential biases relevant to the patient population and clinical domain.  
   * **Oversight:** Design and implement clear **application-level human oversight workflows** for reviewing critical AI outputs during the Alpha phase and potentially beyond.  
6. **Immediate Next Steps:**  
   * Set up the GCP project, enable APIs, and configure authentication for the development team.  
   * Begin curating the initial clinical knowledge base (start small, focus on quality).  
   * Implement the baseline RAG pipeline using RAG Engine, Vertex AI Search, and the chosen Gemini model via the SDK.  
   * Concurrently, establish the evaluation framework, defining key clinical metrics and involving expert reviewers.  
   * Start prototyping the basic agent structure with ADK.  
   * Set up Cloud Billing reports and budget alerts immediately.

By following this structured, iterative, and responsible approach, the HopeAI team can effectively leverage the powerful capabilities of Google Cloud's Vertex AI platform to build an innovative and trustworthy AI clinical assistant for their telehealth service.

#### **Fuentes citadas**

1. Overview of Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/overview](https://cloud.google.com/vertex-ai/generative-ai/docs/overview)  
2. Vertex AI Platform | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai](https://cloud.google.com/vertex-ai)  
3. Building With AI Just Got Easier: Best AI Frameworks For Startups In 2025 \- AngelHack, acceso: mayo 7, 2025, [https://angelhack.com/blog/building-with-ai-just-got-easier-best-ai-frameworks-for-startups-in-2025/](https://angelhack.com/blog/building-with-ai-just-got-easier-best-ai-frameworks-for-startups-in-2025/)  
4. Vertex AI: Rapid and enhanced innovation for companies \- Plain Concepts, acceso: mayo 7, 2025, [https://www.plainconcepts.com/vertex-ai/](https://www.plainconcepts.com/vertex-ai/)  
5. Vertex AI release notes | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/release-notes](https://cloud.google.com/vertex-ai/generative-ai/docs/release-notes)  
6. Google Cloud Next 2025: News and updates, acceso: mayo 7, 2025, [https://blog.google/products/google-cloud/next-2025/](https://blog.google/products/google-cloud/next-2025/)  
7. Vertex AI RAG Engine: A developers tool, acceso: mayo 7, 2025, [https://developers.googleblog.com/en/vertex-ai-rag-engine-a-developers-tool/](https://developers.googleblog.com/en/vertex-ai-rag-engine-a-developers-tool/)  
8. How healthcare organizations are using generative AI search and agents \- Google Blog, acceso: mayo 7, 2025, [https://blog.google/products/google-cloud/himss-2025/](https://blog.google/products/google-cloud/himss-2025/)  
9. Google Cloud Enhances Vertex AI Search for Healthcare with Multimodal AI \- PR Newswire, acceso: mayo 7, 2025, [https://www.prnewswire.com/news-releases/google-cloud-enhances-vertex-ai-search-for-healthcare-with-multimodal-ai-302388639.html](https://www.prnewswire.com/news-releases/google-cloud-enhances-vertex-ai-search-for-healthcare-with-multimodal-ai-302388639.html)  
10. Reproducible Generative AI Evaluation for Healthcare: A Clinician-in-the-Loop Approach, acceso: mayo 7, 2025, [https://www.medrxiv.org/content/10.1101/2025.03.04.25323131v1.full-text](https://www.medrxiv.org/content/10.1101/2025.03.04.25323131v1.full-text)  
11. Balancing AI innovation and responsibility in healthcare | Google Cloud Blog, acceso: mayo 7, 2025, [https://cloud.google.com/transform/unlocking-ais-potential-in-healthcare-balancing-innovation-and-responsibility-gen-ai](https://cloud.google.com/transform/unlocking-ais-potential-in-healthcare-balancing-innovation-and-responsibility-gen-ai)  
12. The latest AI news we announced in April \- Google Blog, acceso: mayo 7, 2025, [https://blog.google/technology/ai/google-ai-updates-april-2025/](https://blog.google/technology/ai/google-ai-updates-april-2025/)  
13. Top Announcements from Google Cloud Next 2025, acceso: mayo 7, 2025, [https://blogs.infoservices.com/google-cloud/google-cloud-next-2025-top-announcements/](https://blogs.infoservices.com/google-cloud/google-cloud-next-2025-top-announcements/)  
14. Responsible AI | Generative AI on Vertex AI | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/learn/responsible-ai](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/responsible-ai)  
15. HIPAA Compliance on Google Cloud | GCP Security, acceso: mayo 7, 2025, [https://cloud.google.com/security/compliance/hipaa](https://cloud.google.com/security/compliance/hipaa)  
16. Quickstart: Generate text using the Vertex AI Gemini API \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal](https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal)  
17. Set up a project and a development environment | Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/start/cloud-environment](https://cloud.google.com/vertex-ai/docs/start/cloud-environment)  
18. LLM Evaluation on Google Vertex AI | articles – Weights & Biases \- Wandb, acceso: mayo 7, 2025, [https://wandb.ai/google\_articles/articles/reports/LLM-Evaluation-on-Google-Vertex-AI--VmlldzoxMDQ0ODI3Mg](https://wandb.ai/google_articles/articles/reports/LLM-Evaluation-on-Google-Vertex-AI--VmlldzoxMDQ0ODI3Mg)  
19. Deploying Machine Learning models w/ Vertex AI on GCP \- Supertype, acceso: mayo 7, 2025, [https://supertype.ai/notes/deploying-machine-learning-models-with-vertex-ai-on-google-cloud-platform](https://supertype.ai/notes/deploying-machine-learning-models-with-vertex-ai-on-google-cloud-platform)  
20. Quickstart: Build an agent with the Agent Development Kit | Generative AI on Vertex AI, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/agent-development-kit/quickstart](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-development-kit/quickstart)  
21. Vertex AI API \- Anthropic, acceso: mayo 7, 2025, [https://docs.anthropic.com/en/api/claude-on-vertex-ai](https://docs.anthropic.com/en/api/claude-on-vertex-ai)  
22. Quickly create RAG apps with Vertex AI Gemini models and Elasticsearch playground, acceso: mayo 7, 2025, [https://www.elastic.co/search-labs/blog/vertex-ai-elasticsearch-playground-fast-rag-apps](https://www.elastic.co/search-labs/blog/vertex-ai-elasticsearch-playground-fast-rag-apps)  
23. Build a pipeline | Vertex AI | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/pipelines/build-pipeline](https://cloud.google.com/vertex-ai/docs/pipelines/build-pipeline)  
24. Vertex AI Studio | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/generative-ai-studio](https://cloud.google.com/generative-ai-studio)  
25. Get Started with Vertex AI Studio | Google Cloud Skills Boost, acceso: mayo 7, 2025, [https://www.cloudskillsboost.google/course\_templates/976/labs/515637](https://www.cloudskillsboost.google/course_templates/976/labs/515637)  
26. Introduction to Generative AI Studio \- Prompt engineering | Google Cloud Skills Boost, acceso: mayo 7, 2025, [https://www.cloudskillsboost.google/course\_templates/552/video/529865](https://www.cloudskillsboost.google/course_templates/552/video/529865)  
27. Introduction to Vertex AI | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/start/introduction-unified-platform](https://cloud.google.com/vertex-ai/docs/start/introduction-unified-platform)  
28. Introduction to Vertex AI Search | AI Applications \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/generative-ai-app-builder/docs/enterprise-search-introduction](https://cloud.google.com/generative-ai-app-builder/docs/enterprise-search-introduction)  
29. Google Vertex AI Tutorial: How To Build AI Agents \[2025\] \- Voiceflow, acceso: mayo 7, 2025, [https://www.voiceflow.com/blog/vertex-ai](https://www.voiceflow.com/blog/vertex-ai)  
30. Vertex Generative AI SDK for Python bookmark\_border \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/reference/python/latest](https://cloud.google.com/vertex-ai/generative-ai/docs/reference/python/latest)  
31. Introduction to the Vertex AI SDK for Python \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/python-sdk/use-vertex-ai-python-sdk](https://cloud.google.com/vertex-ai/docs/python-sdk/use-vertex-ai-python-sdk)  
32. Compare ML Console vs. Vertex AI in 2025 \- Slashdot, acceso: mayo 7, 2025, [https://slashdot.org/software/comparison/ML-Console-vs-Vertex-AI/](https://slashdot.org/software/comparison/ML-Console-vs-Vertex-AI/)  
33. Best Practices for MLOps on GCP: Vertex AI vs. Custom Pipeline? \- Reddit, acceso: mayo 7, 2025, [https://www.reddit.com/r/mlops/comments/1j4wb2s/best\_practices\_for\_mlops\_on\_gcp\_vertex\_ai\_vs/](https://www.reddit.com/r/mlops/comments/1j4wb2s/best_practices_for_mlops_on_gcp_vertex_ai_vs/)  
34. Getting Started with the Vertex AI Gemini API with Visual Studio \- Get Blogged by JoKi, acceso: mayo 7, 2025, [https://jochen.kirstaetter.name/getting-started-with-the-vertex-ai-gemini-with-vs-http/](https://jochen.kirstaetter.name/getting-started-with-the-vertex-ai-gemini-with-vs-http/)  
35. Why use Vertex AI Agent Engine?? : r/googlecloud \- Reddit, acceso: mayo 7, 2025, [https://www.reddit.com/r/googlecloud/comments/1k652gu/why\_use\_vertex\_ai\_agent\_engine/](https://www.reddit.com/r/googlecloud/comments/1k652gu/why_use_vertex_ai_agent_engine/)  
36. Overview of Model Garden | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/model-garden/explore-models](https://cloud.google.com/vertex-ai/generative-ai/docs/model-garden/explore-models)  
37. Models supported by Model Garden | Generative AI on Vertex AI ..., acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/model-garden/available-models](https://cloud.google.com/vertex-ai/generative-ai/docs/model-garden/available-models)  
38. What's new with Google Cloud for 2025 \- Console Connect Blog, acceso: mayo 7, 2025, [https://blog.consoleconnect.com/whats-new-with-google-cloud-for-2025](https://blog.consoleconnect.com/whats-new-with-google-cloud-for-2025)  
39. Announcing the general availability of Llama 4 MaaS on Vertex AI \- Google Developers Blog, acceso: mayo 7, 2025, [https://developers.googleblog.com/en/llama-4-ga-maas-vertex-ai/](https://developers.googleblog.com/en/llama-4-ga-maas-vertex-ai/)  
40. Create MedLM prompts | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/medlm/medlm-prompts](https://cloud.google.com/vertex-ai/generative-ai/docs/medlm/medlm-prompts)  
41. Generative AI beginner's guide | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview)  
42. Our latest AI models \- Google AI, acceso: mayo 7, 2025, [https://ai.google/get-started/our-models/](https://ai.google/get-started/our-models/)  
43. Google's clinical search-and-answer tool can now query images | Healthcare Dive, acceso: mayo 7, 2025, [https://www.healthcaredive.com/news/google-clinical-search-images-vertex-ai-healthcare/741107/](https://www.healthcaredive.com/news/google-clinical-search-images-vertex-ai-healthcare/741107/)  
44. Vertex AI Pricing | Generative AI on Vertex AI | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)  
45. Vertex AI RAG Engine overview \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview)  
46. RAG quickstart for Python | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/rag-quickstart](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-quickstart)  
47. Use data ingestion with Vertex AI RAG Engine \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/use-data-ingestion](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/use-data-ingestion)  
48. Create a search data store | AI Applications \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es)  
49. Vertex AI APIs for building search and RAG experiences | AI Applications \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/generative-ai-app-builder/docs/builder-apis](https://cloud.google.com/generative-ai-app-builder/docs/builder-apis)  
50. Vertex AI RAG Engine: Build & deploy RAG implementations with your data \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/blog/products/ai-machine-learning/introducing-vertex-ai-rag-engine](https://cloud.google.com/blog/products/ai-machine-learning/introducing-vertex-ai-rag-engine)  
51. RAG systems: Best practices to master evaluation for accurate and reliable AI. | Google Cloud Blog, acceso: mayo 7, 2025, [https://cloud.google.com/blog/products/ai-machine-learning/optimizing-rag-retrieval](https://cloud.google.com/blog/products/ai-machine-learning/optimizing-rag-retrieval)  
52. RAG | Vector Search | Vertex AI Search | Grounding \- Google Cloud Community, acceso: mayo 7, 2025, [https://www.googlecloudcommunity.com/gc/AI-ML/RAG-Vector-Search-Vertex-AI-Search-Grounding/m-p/867586](https://www.googlecloudcommunity.com/gc/AI-ML/RAG-Vector-Search-Vertex-AI-Search-Grounding/m-p/867586)  
53. Use Vertex AI Search as a retrieval backend using ... \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/use-vertexai-search](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/use-vertexai-search)  
54. Use Vertex AI Search as a retrieval backend using Vertex AI RAG Engine \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/use-vertexai-search](https://cloud.google.com/vertex-ai/generative-ai/docs/use-vertexai-search)  
55. Vertex AI release notes | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/core-release-notes](https://cloud.google.com/vertex-ai/docs/core-release-notes)  
56. Use Vertex AI Vector Search with Vertex AI RAG Engine \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/use-vertexai-vector-search](https://cloud.google.com/vertex-ai/generative-ai/docs/use-vertexai-vector-search)  
57. Use Vertex AI Vector Search with Vertex AI RAG Engine \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/use-vertexai-vector-search](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/use-vertexai-vector-search)  
58. RAG | Vector Search | Vertex AI Search | Grounding \- Google Cloud Community, acceso: mayo 7, 2025, [https://www.googlecloudcommunity.com/gc/AI-ML/RAG-Vector-Search-Vertex-AI-Search-Grounding/m-p/867586/highlight/true](https://www.googlecloudcommunity.com/gc/AI-ML/RAG-Vector-Search-Vertex-AI-Search-Grounding/m-p/867586/highlight/true)  
59. generative-ai/gemini/rag-engine/rag\_engine\_vector\_search.ipynb at main \- GitHub, acceso: mayo 7, 2025, [https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/rag-engine/rag\_engine\_vector\_search.ipynb](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/rag-engine/rag_engine_vector_search.ipynb)  
60. Google Vertex AI Provides RAG Engine for Large Language Model Grounding \- InfoQ, acceso: mayo 7, 2025, [https://www.infoq.com/news/2025/01/google-vertes-ai-rag-engine/](https://www.infoq.com/news/2025/01/google-vertes-ai-rag-engine/)  
61. Weaviate on Vertex AI RAG Engine: Building RAG Applications on Google Cloud, acceso: mayo 7, 2025, [https://weaviate.io/blog/google-rag-api](https://weaviate.io/blog/google-rag-api)  
62. Mastering Multimodal RAG with Vertex AI & Gemini for Content \- Analytics Vidhya, acceso: mayo 7, 2025, [https://www.analyticsvidhya.com/blog/2025/02/multimodal-rag-with-vertex-ai-gemini/](https://www.analyticsvidhya.com/blog/2025/02/multimodal-rag-with-vertex-ai-gemini/)  
63. Generate grounded answers with RAG | Vertex AI Agent Builder \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/generative-ai-app-builder/docs/grounded-gen](https://cloud.google.com/generative-ai-app-builder/docs/grounded-gen)  
64. Grounding overview | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/grounding/overview](https://cloud.google.com/vertex-ai/generative-ai/docs/grounding/overview)  
65. Vertex AI RAG Engine overview \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/rag-overview](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-overview)  
66. Vertex AI Reviews & Ratings 2025 \- TrustRadius, acceso: mayo 7, 2025, [https://www.trustradius.com/products/google-cloud-vertex-ai/reviews](https://www.trustradius.com/products/google-cloud-vertex-ai/reviews)  
67. Vertex AI Agent Builder | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/products/agent-builder](https://cloud.google.com/products/agent-builder)  
68. Build and manage multi-system agents with Vertex AI | Google Cloud Blog, acceso: mayo 7, 2025, [https://cloud.google.com/blog/products/ai-machine-learning/build-and-manage-multi-system-agents-with-vertex-ai](https://cloud.google.com/blog/products/ai-machine-learning/build-and-manage-multi-system-agents-with-vertex-ai)  
69. Agent Development Kit \- Google, acceso: mayo 7, 2025, [https://google.github.io/adk-docs/](https://google.github.io/adk-docs/)  
70. MCP Toolbox for Databases (formerly Gen AI Toolbox for Databases) now supports Model Context Protocol (MCP) | Google Cloud Blog, acceso: mayo 7, 2025, [https://cloud.google.com/blog/products/ai-machine-learning/mcp-toolbox-for-databases-now-supports-model-context-protocol](https://cloud.google.com/blog/products/ai-machine-learning/mcp-toolbox-for-databases-now-supports-model-context-protocol)  
71. Vertex AI Agent Engine overview \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview)  
72. 7 AI Agent Builders in 2025: Comprehensive Guide | Generative AI Collaboration Platform, acceso: mayo 7, 2025, [https://orq.ai/blog/ai-agentic-builders](https://orq.ai/blog/ai-agentic-builders)  
73. Evaluate AI models with Vertex AI & LLM Comparator | Google Cloud Blog, acceso: mayo 7, 2025, [https://cloud.google.com/blog/products/ai-machine-learning/evaluate-ai-models-with-vertex-ai--llm-comparator](https://cloud.google.com/blog/products/ai-machine-learning/evaluate-ai-models-with-vertex-ai--llm-comparator)  
74. Introduction to Vertex AI Experiments | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/experiments/intro-vertex-ai-experiments](https://cloud.google.com/vertex-ai/docs/experiments/intro-vertex-ai-experiments)  
75. Enhance your prompts with Vertex AI Prompt Optimizer \- Google Developers Blog, acceso: mayo 7, 2025, [https://developers.googleblog.com/en/enhance-your-prompts-with-vertex-ai-prompt-optimizer/](https://developers.googleblog.com/en/enhance-your-prompts-with-vertex-ai-prompt-optimizer/)  
76. Generative AI with Vertex AI: Prompt Design | Google Cloud Skills Boost, acceso: mayo 7, 2025, [https://www.cloudskillsboost.google/paths/118/course\_templates/976/labs/515636](https://www.cloudskillsboost.google/paths/118/course_templates/976/labs/515636)  
77. Run a computation-based evaluation pipeline | Generative AI on ..., acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/generative-ai/models/evaluate-models](https://cloud.google.com/vertex-ai/docs/generative-ai/models/evaluate-models)  
78. A/B Testing of LLM Prompts \- Langfuse, acceso: mayo 7, 2025, [https://langfuse.com/docs/prompts/a-b-testing](https://langfuse.com/docs/prompts/a-b-testing)  
79. Prompt Experiments \- Langfuse, acceso: mayo 7, 2025, [https://langfuse.com/docs/datasets/prompt-experiments](https://langfuse.com/docs/datasets/prompt-experiments)  
80. RAG Testing: Frameworks, Metrics, and Best Practices \- Addepto, acceso: mayo 7, 2025, [https://addepto.com/blog/rag-testing-frameworks-metrics-and-best-practices/](https://addepto.com/blog/rag-testing-frameworks-metrics-and-best-practices/)  
81. Evaluating Retrieval Augmented Generation (RAG) Systems ..., acceso: mayo 7, 2025, [https://googlecloudplatform.github.io/applied-ai-engineering-samples/genai-on-vertex-ai/vertex\_evaluation\_services/evaluation-rag-systems/evaluation\_rag\_use\_cases/](https://googlecloudplatform.github.io/applied-ai-engineering-samples/genai-on-vertex-ai/vertex_evaluation_services/evaluation-rag-systems/evaluation_rag_use_cases/)  
82. ASTRID \- An Automated and Scalable TRIaD for the Evaluation of RAG-based Clinical Question Answering Systems, acceso: mayo 7, 2025, [https://arxiv.org/html/2501.08208v1](https://arxiv.org/html/2501.08208v1)  
83. Evaluations with Vertex AI models \- Ragas, acceso: mayo 7, 2025, [https://docs.ragas.io/en/stable/howtos/applications/vertexai\_x\_ragas/](https://docs.ragas.io/en/stable/howtos/applications/vertexai_x_ragas/)  
84. An Automated and Scalable TRIaD for the Evaluation of RAG-based Clinical Question Answering Systems \- arXiv, acceso: mayo 7, 2025, [https://arxiv.org/html/2501.08208](https://arxiv.org/html/2501.08208)  
85. Define your evaluation metrics | Generative AI on Vertex AI | Google ..., acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/models/determine-eval](https://cloud.google.com/vertex-ai/generative-ai/docs/models/determine-eval)  
86. Gen AI evaluation service overview | Generative AI on Vertex AI ..., acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/models/evaluation-overview](https://cloud.google.com/vertex-ai/generative-ai/docs/models/evaluation-overview)  
87. Evaluating RAG Question Answer bots with Vertex AI and Galileo Evaluate \- Google Cloud Community, acceso: mayo 7, 2025, [https://www.googlecloudcommunity.com/gc/Cloud-Product-Articles/Evaluating-RAG-Question-Answer-bots-with-Vertex-AI-and-Galileo/ta-p/826946](https://www.googlecloudcommunity.com/gc/Cloud-Product-Articles/Evaluating-RAG-Question-Answer-bots-with-Vertex-AI-and-Galileo/ta-p/826946)  
88. Evaluate a simple RAG system \- Ragas, acceso: mayo 7, 2025, [https://docs.ragas.io/en/stable/getstarted/rag\_eval/](https://docs.ragas.io/en/stable/getstarted/rag_eval/)  
89. Model monitoring metrics | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-observability](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-observability)  
90. Monitor your costs, usage, and other metrics of the Gemini API | Vertex AI in Firebase, acceso: mayo 7, 2025, [https://firebase.google.com/docs/vertex-ai/monitoring](https://firebase.google.com/docs/vertex-ai/monitoring)  
91. LLM Observability for Google Cloud's Vertex AI platform \- understand performance, cost and reliability \- Elastic, acceso: mayo 7, 2025, [https://www.elastic.co/observability-labs/blog/elevate-llm-observability-with-gcp-vertex-ai-integration](https://www.elastic.co/observability-labs/blog/elevate-llm-observability-with-gcp-vertex-ai-integration)  
92. acceso: diciembre 31, 1969, [https://cloud.google.com/vertex-ai/docs/monitoring/metrics-reference](https://cloud.google.com/vertex-ai/docs/monitoring/metrics-reference)  
93. Understand pricing | Vertex AI in Firebase \- Google, acceso: mayo 7, 2025, [https://firebase.google.com/docs/vertex-ai/pricing](https://firebase.google.com/docs/vertex-ai/pricing)  
94. Count tokens and billable characters for Gemini models | Vertex AI in Firebase \- Google, acceso: mayo 7, 2025, [https://firebase.google.com/docs/vertex-ai/count-tokens](https://firebase.google.com/docs/vertex-ai/count-tokens)  
95. Use the Count Tokens API | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/get-token-count](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/get-token-count)  
96. Understand and count tokens | Gemini API | Google AI for Developers, acceso: mayo 7, 2025, [https://ai.google.dev/gemini-api/docs/tokens](https://ai.google.dev/gemini-api/docs/tokens)  
97. Google Gen AI SDK documentation \- The GitHub pages site for the googleapis organization., acceso: mayo 7, 2025, [https://googleapis.github.io/python-genai/](https://googleapis.github.io/python-genai/)  
98. GenerateContentResponse | Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/reference/rest/v1/GenerateContentResponse](https://cloud.google.com/vertex-ai/docs/reference/rest/v1/GenerateContentResponse)  
99. Observability and Metrics for Google Vertex AI and Gemini \- Langfuse, acceso: mayo 7, 2025, [https://langfuse.com/docs/integrations/google-vertex-ai](https://langfuse.com/docs/integrations/google-vertex-ai)  
100. Responsible AI Progress Report \- Google AI, acceso: mayo 7, 2025, [https://ai.google/static/documents/ai-responsibility-update-published-february-2025.pdf](https://ai.google/static/documents/ai-responsibility-update-published-february-2025.pdf)  
101. Google Workspace HIPAA Compliance: Securing Patient Data \- Reco AI, acceso: mayo 7, 2025, [https://www.reco.ai/hub/google-workspace-hipaa-compliance](https://www.reco.ai/hub/google-workspace-hipaa-compliance)  
102. Generative AI in Google Workspace Privacy Hub, acceso: mayo 7, 2025, [https://support.google.com/a/answer/15706919?hl=en](https://support.google.com/a/answer/15706919?hl=en)  
103. How Sensitive Data Protection can help secure generative AI workloads \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/blog/products/identity-security/how-sensitive-data-protection-can-help-secure-generative-ai-workloads](https://cloud.google.com/blog/products/identity-security/how-sensitive-data-protection-can-help-secure-generative-ai-workloads)  
104. Safety and content filters | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/configure-safety-filters](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/configure-safety-filters)  
105. MedLM API | Generative AI on Vertex AI \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/medlm](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/medlm)  
106. Gemma 2 – Vertex AI \- Google Cloud Console, acceso: mayo 7, 2025, [https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma2?hl=zh-cn](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma2?hl=zh-cn)  
107. How to Evaluate LLMs: Methods, Metrics & Tools for Assessment \- PromptLayer, acceso: mayo 7, 2025, [https://blog.promptlayer.com/how-to-evaluate-llm/](https://blog.promptlayer.com/how-to-evaluate-llm/)  
108. acceso: diciembre 31, 1969, [https://cloud.google.com/vertex-ai/docs/evaluation/fairness-evaluation](https://cloud.google.com/vertex-ai/docs/evaluation/fairness-evaluation)  
109. Learning Google Cloud Vertex AI: Build, deploy, and manage machine learning models with Vertex AI (English Edition), acceso: mayo 7, 2025, [https://www.amazon.com/Learning-Google-Cloud-Vertex-AI/dp/9355515359](https://www.amazon.com/Learning-Google-Cloud-Vertex-AI/dp/9355515359)  
110. Introduction to Vertex Explainable AI | Vertex AI | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/explainable-ai/overview](https://cloud.google.com/vertex-ai/docs/explainable-ai/overview)  
111. acceso: diciembre 31, 1969, [https://cloud.google.com/vertex-ai/docs/explainable-ai/getting-predictions](https://cloud.google.com/vertex-ai/docs/explainable-ai/getting-predictions)  
112. Understand and use safety settings | Vertex AI in Firebase \- Google, acceso: mayo 7, 2025, [https://firebase.google.com/docs/vertex-ai/safety-settings](https://firebase.google.com/docs/vertex-ai/safety-settings)  
113. acceso: diciembre 31, 1969, [https://cloud.google.com/solutions/ai-governance](https://cloud.google.com/solutions/ai-governance)  
114. acceso: diciembre 31, 1969, [https://cloud.google.com/vertex-ai/docs/pipelines/human-in-the-loop](https://cloud.google.com/vertex-ai/docs/pipelines/human-in-the-loop)  
115. SKU Groups \- Vertex GenAI Offer 2025 \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/skus/sku-groups/vertex-genai-offer-2025](https://cloud.google.com/skus/sku-groups/vertex-genai-offer-2025)  
116. Re: Confused about pricing differences between Vertex AI and Google AI Studio, acceso: mayo 7, 2025, [https://www.googlecloudcommunity.com/gc/AI-ML/Confused-about-pricing-differences-between-Vertex-AI-and-Google/m-p/887859](https://www.googlecloudcommunity.com/gc/AI-ML/Confused-about-pricing-differences-between-Vertex-AI-and-Google/m-p/887859)  
117. About Vertex AI Billing \- Google Cloud Community, acceso: mayo 7, 2025, [https://www.googlecloudcommunity.com/gc/AI-ML/About-Vertex-AI-Billing/m-p/606790](https://www.googlecloudcommunity.com/gc/AI-ML/About-Vertex-AI-Billing/m-p/606790)  
118. LLM API Pricing Calculator | Compare 300+ AI Model Costs \- Helicone, acceso: mayo 7, 2025, [https://www.helicone.ai/llm-cost](https://www.helicone.ai/llm-cost)  
119. Vertex AI Search for Commerce Pricing Calculator \- Nimstrata, acceso: mayo 7, 2025, [https://nimstrata.com/vertex-ai-search-for-retail-pricing-calculator](https://nimstrata.com/vertex-ai-search-for-retail-pricing-calculator)  
120. Gemini Code Assist for teams and businesses, acceso: mayo 7, 2025, [https://codeassist.google/products/business](https://codeassist.google/products/business)  
121. Custom Tune of LLM in Generative AI Studio \- training time/parameters \- Costs, acceso: mayo 7, 2025, [https://www.googlecloudcommunity.com/gc/AI-ML/Custom-Tune-of-LLM-in-Generative-AI-Studio-training-time/td-p/614610](https://www.googlecloudcommunity.com/gc/AI-ML/Custom-Tune-of-LLM-in-Generative-AI-Studio-training-time/td-p/614610)  
122. Billing questions | Vertex AI | Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/vertex-ai/docs/support/billing-questions](https://cloud.google.com/vertex-ai/docs/support/billing-questions)  
123. Analyze billing data and cost trends with Reports | Cloud Billing ..., acceso: mayo 7, 2025, [https://cloud.google.com/billing/docs/how-to/reports](https://cloud.google.com/billing/docs/how-to/reports)  
124. Create, edit, or delete budgets and budget alerts | Cloud Billing \- Google Cloud, acceso: mayo 7, 2025, [https://cloud.google.com/billing/docs/how-to/budgets](https://cloud.google.com/billing/docs/how-to/budgets)  
125. How to set up and use Google Cloud budget alerts \- Terra Support, acceso: mayo 7, 2025, [https://support.terra.bio/hc/en-us/articles/360057589931-How-to-set-up-and-use-Google-Cloud-budget-alerts](https://support.terra.bio/hc/en-us/articles/360057589931-How-to-set-up-and-use-Google-Cloud-budget-alerts)  
126. Cost Optimization Strategies for Vertex AI \- Restack, acceso: mayo 7, 2025, [https://www.restack.io/p/ai-optimization-answer-cost-optimization-strategies-cat-ai](https://www.restack.io/p/ai-optimization-answer-cost-optimization-strategies-cat-ai)  
127. Vertex Ai Cost Optimization Strategies | Restackio, acceso: mayo 7, 2025, [https://www.restack.io/p/ai-optimization-answer-vertex-ai-cost-optimization-cat-ai](https://www.restack.io/p/ai-optimization-answer-vertex-ai-cost-optimization-cat-ai)  
128. Re: API Vertex AI RAG Engine: Upload file in corpus failed \- Google Cloud Community, acceso: mayo 7, 2025, [https://www.googlecloudcommunity.com/gc/AI-ML/API-Vertex-AI-RAG-Engine-Upload-file-in-corpus-failed/m-p/883770](https://www.googlecloudcommunity.com/gc/AI-ML/API-Vertex-AI-RAG-Engine-Upload-file-in-corpus-failed/m-p/883770)  
129. acceso: diciembre 31, 1969, [https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/manage-corpora-and-files](https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/manage-corpora-and-files)  
130. acceso: diciembre 31, 1969, [https://cloud.google.com/vertex-ai/docs/pipelines/overview](https://cloud.google.com/vertex-ai/docs/pipelines/overview)  
131. acceso: diciembre 31, 1969, [https://cloud.google.com/blog/products/ai-machine-learning/orchestrate-llm-and-generative-ai-workflows-with-vertex-ai-pipelines](https://cloud.google.com/blog/products/ai-machine-learning/orchestrate-llm-and-generative-ai-workflows-with-vertex-ai-pipelines)