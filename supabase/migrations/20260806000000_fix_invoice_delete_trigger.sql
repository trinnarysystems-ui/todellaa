-- Fix invoice delete trigger to prevent foreign key violation on payments
CREATE OR REPLACE FUNCTION public.on_invoice_change_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  -- If insert or update: recalculate for NEW customer
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.customer_id IS NOT NULL THEN
    PERFORM public.recalculate_customer_reconciliation(NEW.customer_id);
  END IF;

  -- If update and customer changed: recalculate for OLD customer too
  IF TG_OP = 'UPDATE' AND OLD.customer_id IS NOT NULL AND OLD.customer_id != COALESCE(NEW.customer_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    PERFORM public.recalculate_customer_reconciliation(OLD.customer_id);
  END IF;

  -- If delete: recalculate for OLD customer
  IF TG_OP = 'DELETE' AND OLD.customer_id IS NOT NULL THEN
    -- Explicitly set invoice_id to NULL on any payments whose linked invoices no longer exist (covers multi-row deletes)
    UPDATE public.payments p
    SET invoice_id = NULL
    WHERE p.invoice_id IS NOT NULL 
      AND NOT EXISTS (
        SELECT 1 FROM public.invoices i WHERE i.id = p.invoice_id
      );
    
    PERFORM public.recalculate_customer_reconciliation(OLD.customer_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;
