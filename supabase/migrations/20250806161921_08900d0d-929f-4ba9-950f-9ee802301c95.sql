-- Fix security warning by adding search_path to the function
CREATE OR REPLACE FUNCTION get_final_results(session_id_param text)
RETURNS TABLE (
    id bigint,
    sr_no text,
    risk_category text,
    screening_criteria text,
    threshold text,
    performance text,
    assessment_outcome text,
    session_id text,
    referenced_document text,
    page_number text,
    context text,
    chat_model text,
    embedding_model text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fr.id,
        fr.sr_no,
        fr.risk_category,
        fr.screening_criteria,
        fr.threshold,
        fr.performance,
        fr.assessment_outcome,
        fr.session_id,
        fr.referenced_document,
        fr.page_number,
        fr.context,
        fr.chat_model,
        fr.embedding_model,
        fr.created_at
    FROM final_results fr
    WHERE fr.session_id = session_id_param
    ORDER BY 
        CASE 
            WHEN fr.sr_no ~ '^[0-9]+$' THEN fr.sr_no::integer
            ELSE 999999
        END,
        fr.sr_no;
END;
$$;